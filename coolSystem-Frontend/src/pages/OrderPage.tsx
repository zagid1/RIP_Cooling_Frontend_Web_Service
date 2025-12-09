import React, { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Image, Spinner } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchOrderById, 
    updateOrderFields, 
    updateComponentCount, 
    removeComponentFromOrder,
    submitOrder,
    deleteOrder,
    resolveOrder, 
    resetOperationSuccess,
    clearCurrentOrder
} from '../store/slices/coolingSlice';
import { Trash, CheckCircleFill, ExclamationCircle, Floppy, XCircleFill, CheckLg, CpuFill } from 'react-bootstrap-icons';
import type { AppDispatch, RootState } from '../store';

const DefaultImage = '/mock_images/default.png'; 

const STATUS_DRAFT = 1;
const STATUS_FORMED = 3; 
const STATUS_COMPLETED = 4;
const STATUS_REJECTED = 5;

export const OrderPage = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    
    const { currentOrder, loading, operationSuccess } = useSelector((state: RootState) => state.cooling);
    const { user } = useSelector((state: RootState) => state.user);
    
    const [formData, setFormData] = useState({ room_height: 0, room_area: 0 });
    const [counts, setCounts] = useState<{[key: number]: number}>({});

    // --- 1. ПЕРВИЧНАЯ ЗАГРУЗКА ---
    // Срабатывает только при монтировании компонента (или смене ID)
    useEffect(() => {
        if (id) {
            dispatch(fetchOrderById(id));
        }
        return () => { 
            dispatch(clearCurrentOrder()); 
            dispatch(resetOperationSuccess()); 
        }
    }, [id, dispatch]);


    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval>; 

        const isWaitingForResult = currentOrder && 
                                   currentOrder.status === STATUS_COMPLETED && 
                                   (!currentOrder.cooling_power || currentOrder.cooling_power <= 0);

        if (id && isWaitingForResult) {
            intervalId = setInterval(() => {
                // "Тихое" обновление данных
                dispatch(fetchOrderById(id));
            }, 4000); 
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        }
    }, [id, currentOrder, dispatch]);

    // --- 3. СИНХРОНИЗАЦИЯ ЛОКАЛЬНОГО STATE ---
    useEffect(() => {
        if (currentOrder) {
            setFormData({
                room_area: currentOrder.room_area || 0,
                room_height: currentOrder.room_height || 0,
            });
            
            const countMap: {[key: number]: number} = {};
            currentOrder.components?.forEach(c => {
                if(c.component_id) {
                    countMap[c.component_id] = c.count || 1; 
                }
            });
            setCounts(countMap);
        }
    }, [currentOrder]); 

    // Обработка успешного действия (удаление/смена статуса)
    if (operationSuccess) {
        return (
            <div className="min-vh-100 bg-black d-flex align-items-center justify-content-center">
                <Card className="p-4 shadow rounded-4 text-white border-0" style={{ backgroundColor: '#343a40', maxWidth: '450px' }}>
                    <div className="text-center">
                        <CheckCircleFill size={40} className="text-success mb-3"/>
                        <h4 className="mb-2">Успешно!</h4>
                        <p className="text-light opacity-75 small">Действие выполнено.</p>
                        <div className="d-flex justify-content-center gap-2 mt-3">
                            <Link to="/components"><Button variant="outline-light" size="sm">К компонентам</Button></Link>
                            <Link to="/orders"><Button variant="light" size="sm">К заявкам</Button></Link>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // --- АНТИ-ФЛИКЕР (Главное отличие) ---
    // Показываем спиннер ТОЛЬКО если идет загрузка И данных нет совсем.
    // Если данные есть, а мы просто обновляем их в фоне (Polling), спиннер не показываем.
    if (loading && !currentOrder) {
        return (
            <div className="min-vh-100 bg-black d-flex align-items-center justify-content-center">
                <Spinner animation="border" variant="light" size="sm" />
            </div>
        );
    }

    // Если загрузка закончилась, но данных нет (ошибка или удалено)
    if (!currentOrder) return null;

    // --- ЛОГИКА ОТОБРАЖЕНИЯ ---
    const isDraft = currentOrder.status === STATUS_DRAFT;
    const isFormed = currentOrder.status === STATUS_FORMED;
    const isCompleted = currentOrder.status === STATUS_COMPLETED;
    const isRejected = currentOrder.status === STATUS_REJECTED;
    
    // Специальный флаг: Статус ОК, но результата еще нет
    const isCalculating = isCompleted && (!currentOrder.cooling_power || currentOrder.cooling_power <= 0);

    const isModerator = user?.moderator;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setFormData(prev => ({ ...prev, [e.target.name]: val }));
    };

    const handleSaveMain = () => {
        if(currentOrder.id) {
            dispatch(updateOrderFields({ 
                id: currentOrder.id, 
                data: formData 
            }))
            .unwrap()
            .then(() => alert("Параметры сохранены"))
            .catch(() => alert("Ошибка сохранения"));
        }
    };

    const handleSaveCount = (componentId: number) => {
        if(currentOrder.id && counts[componentId] !== undefined) {
            dispatch(updateComponentCount({
                orderId: currentOrder.id,
                componentId: componentId,
                count: counts[componentId]
            }))
            .unwrap()
            .then(() => alert("Кол-во обновлено"))
            .catch(() => alert("Ошибка"));
        }
    };

    const handleApprove = () => {
        if (currentOrder.id && window.confirm("Подтвердить заявку и завершить расчет?")) {
            dispatch(resolveOrder({ id: currentOrder.id, action: 'complete' }));
        }
    };

    const handleReject = () => {
        if (currentOrder.id && window.confirm("Отклонить заявку?")) {
            dispatch(resolveOrder({ id: currentOrder.id, action: 'reject' }));
        }
    };

    return (
        <div className="min-vh-100 bg-black pb-5">
            <Container className="pt-4 mt-4">
                
                <div className="d-flex flex-column flex-md-row gap-3 mb-3">
                    {/* Левая панель: Ввод данных */}
                    <div className="flex-fill" style={{ flexBasis: '50%' }}>
                        <Card className="h-100 border-0 shadow text-white" style={{ backgroundColor: '#343a40' }}>
                            <Card.Body className="p-3">
                                <div className="d-flex justify-content-between align-items-center mb-2 border-bottom border-secondary pb-1">
                                    <h6 className="fw-bold m-0 text-light">Параметры помещения</h6>
                                    {isDraft && (
                                        <Button 
                                            variant="link" 
                                            size="sm" 
                                            onClick={handleSaveMain} 
                                            className="text-info p-0 text-decoration-none"
                                        >
                                            <Floppy size={14} className="me-1"/> Сохранить
                                        </Button>
                                    )}
                                </div>
                                <Form>
                                    <div className="d-flex gap-3">
                                        <Form.Group className="flex-fill">
                                            <Form.Label className="text-light opacity-75 small mb-1">Площадь (м²)</Form.Label>
                                            <Form.Control 
                                                size="sm"
                                                type="number" 
                                                name="room_area" 
                                                value={formData.room_area} 
                                                onChange={handleInputChange} 
                                                disabled={!isDraft}
                                                className="bg-dark text-white border-secondary"
                                            />
                                        </Form.Group>
                                        <Form.Group className="flex-fill">
                                            <Form.Label className="text-light opacity-75 small mb-1">Высота (м)</Form.Label>
                                            <Form.Control 
                                                size="sm"
                                                type="number" 
                                                name="room_height" 
                                                value={formData.room_height} 
                                                onChange={handleInputChange} 
                                                disabled={!isDraft}
                                                className="bg-dark text-white border-secondary"
                                            />
                                        </Form.Group>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Правая панель: Результат */}
                    <div className="flex-fill" style={{ flexBasis: '50%' }}>
                        <Card className="h-100 border-0 shadow text-white" style={{ backgroundColor: '#343a40' }}>
                            <Card.Body className="p-3">
                                <h5 className="fw-bold mb-3 text-center text-light">Результат расчета</h5>
                                
                                {/* 1. ПОКАЗ РЕЗУЛЬТАТА (Уже есть цифры) */}
                                {(isCompleted || (isFormed && isModerator)) && (currentOrder.cooling_power || 0) > 0 ? (
                                    <div className="text-center">
                                        <div className="p-3 rounded-3 border border-success w-100 mb-3" style={{ backgroundColor: '#19875422' }}>
                                            <div className="text-light opacity-75 small text-uppercase fw-bold mb-1">
                                                Требуемая мощность
                                            </div>
                                            <div className="display-6 fw-bold text-white">
                                                {currentOrder.cooling_power} КВт
                                            </div>
                                        </div>
                                        
                                        {isCompleted && (
                                            <p className="text-light opacity-50 small m-0">
                                                Расчет завершен успешно.
                                            </p>
                                        )}
                                        
                                        {isFormed && (
                                            <div className="text-warning small mt-2 fst-italic opacity-75">
                                                * Предварительный расчет (Заявка еще не принята)
                                            </div>
                                        )}
                                    </div>
                                ) : null}

                                {/* 1.1. ОЖИДАНИЕ РАСЧЕТА (Статус Завершена, но цифр еще нет) */}
                                {isCalculating && (
                                    <div className="text-center py-4 text-info">
                                        <Spinner animation="border" variant="info" className="mb-3"/>
                                        <h6 className="fw-bold">Производится расчет...</h6>
                                        <p className="text-light opacity-50 small">Асинхронный сервис обрабатывает данные</p>
                                    </div>
                                )}

                                {/* 2. ОТКЛОНЕНА */}
                                {isRejected && (
                                    <div className="text-center py-4">
                                        <ExclamationCircle size={40} className="text-danger mb-3" />
                                        <h5 className="text-danger fw-bold">Заявка отклонена</h5>
                                        <p className="text-light opacity-50 small">Свяжитесь с администратором.</p>
                                    </div>
                                )}

                                {/* 3. В ОБРАБОТКЕ (Обычный пользователь) */}
                                {isFormed && !isModerator && (
                                    <div className="text-center py-4 text-light opacity-75">
                                        <Spinner animation="border" size="sm" variant="light" className="me-2"/>
                                        Ожидание проверки модератором...
                                    </div>
                                )}

                                {/* 4. В ОБРАБОТКЕ (Модератор, заявка ждет решения) */}
                                {isFormed && isModerator && (!currentOrder.cooling_power) && (
                                    <div className="text-center py-4">
                                        <ExclamationCircle size={40} className="text-warning mb-3" />
                                        <h5 className="text-warning fw-bold">Требует проверки</h5>
                                        <p className="text-light opacity-50 small">Примите решение ниже</p>
                                    </div>
                                )}

                                {/* 5. ЧЕРНОВИК */}
                                {isDraft && (
                                    <div className="text-center py-4 text-light opacity-50">
                                        <CpuFill size={32} className="mb-2 opacity-50"/>
                                        <div>Заполните параметры и нажмите "Сформировать"</div>
                                    </div>
                                )}

                            </Card.Body>
                        </Card>
                    </div>
                </div>

                {/* ПАНЕЛЬ ДЕЙСТВИЙ (Черновик - Пользователь) */}
                {isDraft && (
                    <div className="d-flex justify-content-between align-items-center bg-dark p-2 px-3 rounded-3 border border-secondary mb-3">
                        <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => {
                                if(window.confirm('Удалить эту заявку?')) dispatch(deleteOrder(currentOrder.id!));
                            }}
                        >
                            <Trash size={14} className="me-1"/> Удалить
                        </Button>

                        <div className="text-white small opacity-50">
                            ID: {currentOrder.id}
                        </div>

                        <Button 
                            variant="light" 
                            size="sm" 
                            className="fw-bold px-3"
                            onClick={() => dispatch(submitOrder(currentOrder.id!))}
                            disabled={!currentOrder.components?.length}
                        >
                            Сформировать <CheckCircleFill className="ms-1" size={14}/>
                        </Button>
                    </div>
                )}

                {/* ПАНЕЛЬ ДЕЙСТВИЙ МОДЕРАТОРА */}
                {isModerator && isFormed && (
                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3 mb-3 border border-warning" style={{ backgroundColor: '#443c30' }}>
                        <span className="text-white fw-bold"> <ExclamationCircle className="me-2 text-warning"/> Действия модератора</span>
                        
                        <div className="d-flex gap-3">
                            <Button variant="outline-danger" size="sm" onClick={handleReject}>
                                <XCircleFill className="me-1" /> Отклонить
                            </Button>
                            <Button variant="success" size="sm" onClick={handleApprove}>
                                <CheckLg className="me-1" /> Принять заявку
                            </Button>
                        </div>
                    </div>
                )}

                <h6 className="text-white mb-2 ps-1 small">Компоненты ({currentOrder.components?.length || 0})</h6>
                <div className="d-flex flex-column gap-2 mb-4">
                    {currentOrder.components?.map((c) => (
                        <Card key={c.component_id} className="border-0 shadow text-white" style={{ backgroundColor: '#343a40' }}>
                            <Card.Body className="p-2">
                                <div className="d-flex align-items-center">
                                    
                                    <div className="me-3" style={{ width: 50, height: 50 }}>
                                        <Image 
                                            key={c.component_id + (c.image_url || '')}
                                            src={c.image_url || DefaultImage} 
                                            fluid 
                                            rounded 
                                            referrerPolicy="no-referrer"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                if (target.src !== window.location.origin + DefaultImage) {
                                                    target.src = DefaultImage;
                                                }
                                            }}
                                        />
                                    </div>
                                    
                                    <div className="flex-grow-1">
                                        <h6 className="fw-bold mb-0 text-white small">{c.title}</h6>
                                        <Link to={`/components/${c.component_id}`} className="text-decoration-none text-info" style={{ fontSize: '0.75rem' }}>
                                            Подробнее
                                        </Link>
                                    </div>

                                    <div className="d-flex align-items-center gap-2">
                                        <div className="d-flex align-items-center bg-dark rounded border border-secondary px-2 py-1" style={{ height: '32px' }}>
                                            <span className="text-secondary small me-2" style={{ fontSize: '0.7rem' }}>Кол-во:</span>
                                            <input
                                                type="number"
                                                min="1"
                                                value={counts[c.component_id!] || 1}
                                                onChange={(e) => setCounts(prev => ({ ...prev, [c.component_id!]: parseInt(e.target.value) || 1 }))}
                                                disabled={!isDraft} 
                                                className="bg-transparent border-0 text-white text-center p-0"
                                                style={{ width: '30px', outline: 'none', fontSize: '0.9rem' }}
                                            />
                                        </div>

                                        {isDraft && (
                                            <>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline-success" 
                                                    className="p-1 d-flex align-items-center justify-content-center"
                                                    style={{ width: '30px', height: '30px' }}
                                                    onClick={() => handleSaveCount(c.component_id!)}
                                                    title="Сохранить"
                                                >
                                                    <Floppy size={14} />
                                                </Button>
                                                <Button 
                                                    size="sm"
                                                    variant="outline-danger" 
                                                    className="p-1 d-flex align-items-center justify-content-center"
                                                    style={{ width: '30px', height: '30px' }}
                                                    onClick={() => dispatch(removeComponentFromOrder({ orderId: currentOrder.id!, componentId: c.component_id! }))}
                                                    title="Удалить"
                                                >
                                                    <Trash size={14} />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                    
                    {(!currentOrder.components || currentOrder.components.length === 0) && (
                        <div className="text-center text-secondary small py-3 border border-secondary rounded border-dashed">
                            Список пуст
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
};
