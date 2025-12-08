import React, { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Image, Spinner } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { DefaultImage } from '../components/ComponentCard';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchOrderById, 
    updateOrderFields, 
    updateComponentCount, 
    removeComponentFromOrder,
    submitOrder,
    deleteOrder,
    resetOperationSuccess,
    clearCurrentOrder
} from '../store/slices/coolingSlice';
import { Trash, CheckCircleFill, ExclamationCircle, Floppy } from 'react-bootstrap-icons';
import type { AppDispatch, RootState } from '../store';

const STATUS_DRAFT = 1;
const STATUS_COMPLETED = 4;
const STATUS_REJECTED = 5;

export const OrderPage = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { currentOrder, loading, operationSuccess } = useSelector((state: RootState) => state.cooling);
    
    const [formData, setFormData] = useState({ room_height: 0, room_area: 0 });
    const [counts, setCounts] = useState<{[key: number]: number}>({});

    useEffect(() => {
        if (id) {
            dispatch(fetchOrderById(id));
        }
        return () => { dispatch(clearCurrentOrder()); dispatch(resetOperationSuccess()); }
    }, [id, dispatch]);

    useEffect(() => {
        if (currentOrder) {
            // 1. Заполняем основные поля
            setFormData({
                room_area: currentOrder.room_area || 0,
                room_height: currentOrder.room_height || 0,
            });
            
            // 2. Заполняем количество компонентов
            const countMap: {[key: number]: number} = {};
            
            // ОТЛАДКА: Посмотрим в консоли, что реально приходит с сервера
            console.log("Данные с сервера (currentOrder):", currentOrder);

            currentOrder.components?.forEach(c => {
                if(c.component_id) {
                    // ВАЖНО: Проверьте в консоли, как называется поле количества.
                    // Если сервер возвращает null или undefined, сработает || 1
                    countMap[c.component_id] = c.count || 1; 
                }
            });
            setCounts(countMap);
        }
    // Изменили зависимость: теперь реагируем на любые изменения данных заявки, а не только ID
    }, [currentOrder]); 

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

    if (loading || !currentOrder) return (
        <div className="min-vh-100 bg-black d-flex align-items-center justify-content-center">
            <Spinner animation="border" variant="light" size="sm" />
        </div>
    );

    const isDraft = currentOrder.status === STATUS_DRAFT;
    const isCompleted = currentOrder.status === STATUS_COMPLETED;
    const isRejected = currentOrder.status === STATUS_REJECTED;

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

    return (
        <div className="min-vh-100 bg-black pb-5">
            <Container className="pt-4 mt-4"> {/* Уменьшил верхний отступ */}
                
                {/* Основной контент (Параметры и Статус) - Компактный вид */}
                <div className="d-flex flex-column flex-md-row gap-3 mb-3">
                    
                    {/* Левая панель: Ввод данных */}
                    <div className="flex-fill" style={{ flexBasis: '50%' }}>
                        <Card className="h-100 border-0 shadow text-white" style={{ backgroundColor: '#343a40' }}>
                            <Card.Body className="p-3"> {/* p-3 вместо p-4 */}
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

                    {/* Правая панель: Статус */}
                    <div className="flex-fill" style={{ flexBasis: '50%' }}>
                        <Card className="h-100 border-0 shadow text-white" style={{ backgroundColor: '#343a40' }}>
                            <Card.Body className="p-3 d-flex flex-column justify-content-center align-items-center text-center">
                                {isCompleted ? (
                                    <>
                                        <CheckCircleFill size={24} className="text-success mb-2"/>
                                        <h6 className="text-success fw-bold m-0">Заявка выполнена</h6>
                                    </>
                                ) : isRejected ? (
                                    <>
                                        <ExclamationCircle size={24} className="text-danger mb-2" />
                                        <h6 className="text-danger fw-bold m-0">Отклонена</h6>
                                    </>
                                ) : (
                                    <span className="text-light opacity-50 small">
                                        Статус: {isDraft ? 'Черновик' : 'В обработке'}
                                    </span>
                                )}
                            </Card.Body>
                        </Card>
                    </div>
                </div>

                {/* ПАНЕЛЬ ДЕЙСТВИЙ (Перемещена СЮДА, выше компонентов) */}
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

                {/* Список компонентов (Компактный) */}
                <h6 className="text-white mb-2 ps-1 small">Компоненты ({currentOrder.components?.length || 0})</h6>
                <div className="d-flex flex-column gap-2 mb-4"> {/* gap-2 вместо gap-3 */}
                    {currentOrder.components?.map((c) => (
                        <Card key={c.component_id} className="border-0 shadow text-white" style={{ backgroundColor: '#343a40' }}>
                            <Card.Body className="p-2"> {/* p-2 очень компактно */}
                                <div className="d-flex align-items-center">
                                    
                                    {/* Картинка */}
                                    <div className="me-3" style={{ width: 50, height: 50 }}> {/* 50x50px */}
                                        <Image 
                                            key={c.image_url} 
                                            src={c.image_url || DefaultImage} 
                                            fluid 
                                            rounded 
                                            referrerPolicy="no-referrer"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    
                                    {/* Название */}
                                    <div className="flex-grow-1">
                                        <h6 className="fw-bold mb-0 text-white small">{c.title}</h6>
                                        <Link to={`/components/${c.component_id}`} className="text-decoration-none text-info" style={{ fontSize: '0.75rem' }}>
                                            Подробнее
                                        </Link>
                                    </div>

                                    {/* Управление количеством */}
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