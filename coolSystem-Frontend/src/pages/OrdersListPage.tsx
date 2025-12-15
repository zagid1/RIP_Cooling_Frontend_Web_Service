import React, { useEffect, useState, useMemo } from 'react';
import { Container, Table, Form, Badge, Spinner, Card, ListGroup, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCoolingList } from '../store/slices/coolingSlice';
import { PersonFill, ExclamationCircleFill, Funnel } from 'react-bootstrap-icons';
import type { AppDispatch, RootState } from '../store';

const STATUS_FORMED = 3;

const getStatusBadge = (status: number | undefined) => {
    switch (status) {
        case 1: return <Badge bg="secondary" text="white">Черновик</Badge>;
        case 2: return <Badge bg="light" text="dark">Удалена</Badge>; 
        case 3: return <Badge bg="primary">В работе</Badge>;
        case 4: return <Badge bg="success">Завершена</Badge>;
        case 5: return <Badge bg="danger">Отклонена</Badge>;
        default: return <Badge bg="secondary">Неизвестно</Badge>;
    }
};

export const OrdersListPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { list, loading } = useSelector((state: RootState) => state.cooling);
    const { user } = useSelector((state: RootState) => state.user);

    const [filters, setFilters] = useState({
        status: 'all',
        from: '',
        to: ''
    });

    const [selectedCreatorId, setSelectedCreatorId] = useState<number | 'all'>('all');

    // --- SHORT POLLING (Автообновление каждые 5 сек) ---
    useEffect(() => {
        const loadData = () => dispatch(fetchCoolingList(filters));
        loadData();
        const intervalId = setInterval(loadData, 5000);
        return () => clearInterval(intervalId);
    }, [dispatch, filters]);

    // --- СТАТИСТИКА ПО ПОЛЬЗОВАТЕЛЯМ (Для модератора) ---
    const creatorsStats = useMemo(() => {
        if (!list) return [];
        // Группируем по creator_id (предполагаем, что оно есть в объекте заявки)
        const stats = new Map<number, { countFormed: number, total: number, name: string }>();

        list.forEach(order => {
            // Если поля creator_id нет, используем 0 или заглушку
            const creatorId = order.creator_id || 0; 
            const creatorName = `Пользователь #${creatorId}`; 

            if (!stats.has(creatorId)) {
                stats.set(creatorId, { countFormed: 0, total: 0, name: creatorName });
            }
            
            const stat = stats.get(creatorId)!;
            stat.total += 1;
            if (order.status === STATUS_FORMED) {
                stat.countFormed += 1;
            }
        });

        return Array.from(stats.entries()).map(([id, data]) => ({ id, ...data }));
    }, [list]);

    // --- ФИЛЬТРАЦИЯ СПИСКА ---
    const displayedList = useMemo(() => {
        if (!list) return [];
        if (!user?.moderator) return list;
        
        if (selectedCreatorId === 'all') return list;
        return list.filter(order => order.creator_id === selectedCreatorId);
    }, [list, user?.moderator, selectedCreatorId]);

    const handleRowClick = (id: number | undefined) => {
        if (id) navigate(`/cooling/${id}`);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        // Общий фон страницы - черный
        <div className="min-vh-100 bg-black pb-5">
            <Container className="pt-5 mt-5">
                <h2 className="fw-bold mb-4 text-center text-white">
                    {user?.moderator ? 'Панель Модератора' : 'История заявок'}
                </h2>

                {/* Основной контейнер Flexbox */}
                <div className="d-flex flex-column flex-lg-row gap-4">
                    
                    {/* --- ЛЕВАЯ КОЛОНКА (Только для модератора) --- */}
                    {user?.moderator && (
                        <div style={{ minWidth: '280px' }}>
                            <Card className="shadow border-0 h-100 text-white" style={{ backgroundColor: '#343a40' }}>
                                <Card.Header className="bg-danger text-white fw-bold d-flex align-items-center gap-2 border-bottom border-secondary">
                                    <PersonFill /> Пользователи
                                </Card.Header>
                                <ListGroup variant="flush">
                                    <ListGroup.Item 
                                        action 
                                        active={selectedCreatorId === 'all'}
                                        onClick={() => setSelectedCreatorId('all')}
                                        className="d-flex justify-content-between align-items-center bg-dark text-white border-secondary"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span>Все</span>
                                        <Badge bg="secondary" pill>{list.length}</Badge>
                                    </ListGroup.Item>
                                    
                                    {creatorsStats.map(creator => (
                                        <ListGroup.Item 
                                            key={creator.id}
                                            action
                                            active={selectedCreatorId === creator.id}
                                            onClick={() => setSelectedCreatorId(creator.id)}
                                            className="d-flex justify-content-between align-items-center bg-dark text-white border-secondary"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <span>{creator.name}</span>
                                            <div className="d-flex gap-2 align-items-center">
                                                {creator.countFormed > 0 && (
                                                    <ExclamationCircleFill className="text-warning" title="Есть необработанные заявки" />
                                                )}
                                                <Badge bg="secondary" pill>{creator.total}</Badge>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card>
                        </div>
                    )}

                    {/* --- ПРАВАЯ КОЛОНКА (Таблица и фильтры) --- */}
                    <div className="flex-fill">
                        {/* Карточка фильтров: темно-серая */}
                        <Card className="mb-4 border-0 shadow text-white" style={{ backgroundColor: '#343a40' }}>
                            <Card.Body>
                                <div className="d-flex flex-column flex-md-row gap-3 align-items-end">
                                    <div className="flex-fill w-100">
                                        <Form.Label className="text-light fw-medium small">Статус</Form.Label>
                                        <Form.Select 
                                            name="status" 
                                            value={filters.status} 
                                            onChange={handleFilterChange}
                                            className="bg-dark text-white border-secondary form-select-sm"
                                        >
                                            <option value="all">Любой статус</option>
                                            <option value="3">В работе (Сформирована)</option>
                                            <option value="4">Завершена</option>
                                            <option value="5">Отклонена</option>
                                        </Form.Select>
                                    </div>
                                    <div className="flex-fill w-100">
                                        <Form.Label className="text-light fw-medium small">Дата (от)</Form.Label>
                                        <Form.Control 
                                            type="date" 
                                            name="from" 
                                            value={filters.from} 
                                            onChange={handleFilterChange}
                                            className="bg-dark text-white border-secondary form-control-sm"
                                        />
                                    </div>
                                    <div className="flex-fill w-100">
                                        <Form.Label className="text-light fw-medium small">Дата (до)</Form.Label>
                                        <Form.Control 
                                            type="date" 
                                            name="to" 
                                            value={filters.to} 
                                            onChange={handleFilterChange}
                                            className="bg-dark text-white border-secondary form-control-sm"
                                        />
                                    </div>
                                    {user?.moderator && (
                                        <div>
                                            <Button 
                                                variant="outline-light" 
                                                size="sm" 
                                                onClick={() => dispatch(fetchCoolingList(filters))}
                                                className="d-flex align-items-center gap-2"
                                            >
                                                Обновить <Funnel />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>

                        {loading && list.length === 0 ? (
                            <div className="text-center pt-5">
                                <Spinner animation="border" variant="light" />
                            </div>
                        ) : (
                            <div className="table-responsive shadow rounded">
                                <Table hover variant="dark" className="align-middle mb-0">
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #6c757d' }}>
                                            <th className="py-3 text-white">#</th>
                                            {/* Показываем колонку с ID юзера только модератору */}
                                            {user?.moderator && <th className="py-3 text-white">User ID</th>}
                                            <th className="py-3 text-white">Статус</th>                            
                                            <th className="py-3 text-white">Дата создания</th>
                                            <th className="py-3 text-white">Дата оформления</th> 
                                            <th className="py-3 text-white">Результат</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedList.length > 0 ? displayedList.map((order) => (
                                            <tr 
                                                key={order.id} 
                                                onClick={() => handleRowClick(order.id)} 
                                                style={{ cursor: 'pointer', borderBottom: '1px solid #495057' }}
                                                // Подсветка для модератора, если статус "В работе"
                                                className={user?.moderator && order.status === STATUS_FORMED ? "bg-dark bg-gradient" : ""}
                                            >
                                                <td className="fw-bold text-white">
                                                    {order.id}
                                                    {user?.moderator && order.status === STATUS_FORMED && (
                                                        <span className="ms-2 text-warning" title="Требует внимания">●</span>
                                                    )}
                                                </td>
                                                {user?.moderator && (
                                                    <td className="text-light small">#{order.creator_id}</td>
                                                )}
                                                <td>{getStatusBadge(order.status)}</td>
                                                
                                                <td className="text-light opacity-75 small">
                                                    {order.creation_date 
                                                        ? new Date(order.creation_date).toLocaleDateString() 
                                                        : '-'}
                                                </td>

                                                <td className="text-light opacity-75 small">
                                                    {order.forming_date 
                                                        ? new Date(order.forming_date).toLocaleString('ru-RU') 
                                                        : '-'}
                                                </td>
                                                
                                                {/* Колонка результата (Cooling Power) */}
                                                <td>
                                                    {(order.cooling_power || 0) > 0 ? (
                                                        <span className="fw-bold text-success">
                                                            {order.cooling_power!} КВт
                                                        </span>
                                                    ) : (
                                                        <span className="text-secondary small">--</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={user?.moderator ? 6 : 5} className="text-center py-5 text-secondary">
                                                    Заявок не найдено
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
};