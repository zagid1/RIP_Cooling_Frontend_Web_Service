import React, { useEffect, useState } from 'react';
import { Container, Table, Form, Badge, Spinner, Card, ListGroup, Button, Pagination, Toast, ToastContainer } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCoolingList } from '../store/slices/coolingSlice';
import { PersonFill, Funnel, ClockHistory, ExclamationCircleFill } from 'react-bootstrap-icons';
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

// Функция для форматирования даты (защита от 0001-01-01)
const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    // Если год <= 1 или дата невалидна
    if (isNaN(date.getTime()) || date.getFullYear() <= 1) return '-';
    
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const OrdersListPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    
    // Получаем данные из Redux
    const { list, loading, total, requestTime, userStats } = useSelector((state: RootState) => state.cooling);
    const { user } = useSelector((state: RootState) => state.user);

    // --- НАСТРОЙКИ ---
    const [page, setPage] = useState(1);
    const pageSize = 10; // Строго 10 элементов на странице
    
    // Помощник для даты
    const getTodayDate = () => {
        const date = new Date();
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    };

    // Фильтры
    const [filters, setFilters] = useState({
        status: 'all',
        from: getTodayDate(),
        to: getTodayDate()
    });

    // Выбранный пользователь (для модератора)
    const [selectedCreatorId, setSelectedCreatorId] = useState<number | 'all'>('all');
    
    // UI состояние
    const [showToast, setShowToast] = useState(false);

    // --- ЗАГРУЗКА ДАННЫХ (Polling) ---
    useEffect(() => {
        const loadData = () => {
            dispatch(fetchCoolingList({ 
                ...filters, 
                page, 
                page_size: pageSize,
                useIndex: false, // ЗАХАРДКОЖЕНО TRUE
                // Передаем ID создателя на бэкенд для фильтрации!
                creator_id: selectedCreatorId 
            }));
        };

        loadData();
        
        // Автообновление каждые 5 сек
        const intervalId = setInterval(loadData, 5000);
        return () => clearInterval(intervalId);
        
    // Зависимости: при изменении фильтров, страницы или юзера -> перезапрос
    }, [dispatch, filters, page, selectedCreatorId]);

    // Показ Toast с временем выполнения
    useEffect(() => {
        if (requestTime) {
            setShowToast(true);
            const timer = setTimeout(() => setShowToast(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [requestTime]);

    // --- ОБРАБОТЧИКИ ---
    
    const handleRowClick = (id: number | undefined) => {
        if (id) navigate(`/cooling/${id}`);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPage(1); // При смене фильтров всегда идем на 1 страницу
    };

    const handleUserSelect = (id: number | 'all') => {
        setSelectedCreatorId(id);
        setPage(1); // При смене юзера тоже идем на 1 страницу
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const totalPages = Math.ceil((total || 0) / pageSize);

    return (
        <div className="min-vh-100 bg-black pb-5">
            <Container className="pt-5 mt-5">
                <h2 className="fw-bold mb-4 text-center text-white">
                    {user?.moderator ? 'Панель Модератора' : 'История заявок'}
                    <span className="fs-6 text-secondary ms-3">({total} записей)</span>
                </h2>

                <div className="d-flex flex-column flex-lg-row gap-4">
                    
                    {/* --- ЛЕВАЯ КОЛОНКА: СТАТИСТИКА ПО ЮЗЕРАМ (Только Модератор) --- */}
                    {user?.moderator && (
                        <div style={{ minWidth: '280px' }}>
                            <Card className="shadow border-0 h-100 text-white" style={{ backgroundColor: '#343a40' }}>
                                <Card.Header className="bg-danger text-white fw-bold d-flex align-items-center gap-2 border-bottom border-secondary">
                                    <PersonFill /> Пользователи (Всего)
                                </Card.Header>
                                <ListGroup variant="flush">
                                    {/* Кнопка "Все" */}
                                    <ListGroup.Item 
                                        action 
                                        active={selectedCreatorId === 'all'}
                                        onClick={() => handleUserSelect('all')}
                                        className="d-flex justify-content-between align-items-center bg-dark text-white border-secondary"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span>Все</span>
                                        {/* Суммируем общее количество из статистики */}
                                        <Badge bg="secondary" pill>
                                            {userStats ? userStats.reduce((acc, curr) => acc + curr.count, 0) : 0}
                                        </Badge>
                                    </ListGroup.Item>
                                    
                                    {/* Список пользователей из userStats (это реальные цифры из БД) */}
                                    {userStats && userStats.map(stat => (
                                        <ListGroup.Item 
                                            key={stat.user_id}
                                            action
                                            active={selectedCreatorId === stat.user_id}
                                            onClick={() => handleUserSelect(stat.user_id)}
                                            className="d-flex justify-content-between align-items-center bg-dark text-white border-secondary"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="d-flex align-items-center">
                                                <span>User #{stat.user_id}</span>
                                            </div>
                                            <Badge bg="secondary" pill>{stat.count}</Badge>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card>
                        </div>
                    )}

                    {/* --- ПРАВАЯ КОЛОНКА: ТАБЛИЦА И ФИЛЬТРЫ --- */}
                    <div className="flex-fill">
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
                                            <option value="3">В работе</option>
                                            <option value="4">Завершена</option>
                                            <option value="5">Отклонена</option>
                                        </Form.Select>
                                    </div>
                                    <div className="flex-fill w-100">
                                        <Form.Label className="text-light fw-medium small">Дата (от)</Form.Label>
                                        <Form.Control 
                                            type="date" name="from" value={filters.from} onChange={handleFilterChange}
                                            className="bg-dark text-white border-secondary form-control-sm"
                                        />
                                    </div>
                                    <div className="flex-fill w-100">
                                        <Form.Label className="text-light fw-medium small">Дата (до)</Form.Label>
                                        <Form.Control 
                                            type="date" name="to" value={filters.to} onChange={handleFilterChange}
                                            className="bg-dark text-white border-secondary form-control-sm"
                                        />
                                    </div>
                                    {user?.moderator && (
                                        <div>
                                            <Button 
                                                variant="outline-light" size="sm" 
                                                // Ручное обновление (хотя polling и так работает)
                                                onClick={() => dispatch(fetchCoolingList({ 
                                                    ...filters, page, page_size: pageSize, useIndex: true, creator_id: selectedCreatorId 
                                                }))}
                                                className="d-flex align-items-center gap-2"
                                            >
                                                <Funnel />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>

                        {/* ТАБЛИЦА */}
                        {loading && list.length === 0 ? (
                            <div className="text-center pt-5">
                                <Spinner animation="border" variant="light" />
                            </div>
                        ) : (
                            <>
                                <div className="table-responsive shadow rounded">
                                    <Table hover variant="dark" className="align-middle mb-0">
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #6c757d' }}>
                                                <th className="py-3 text-white">#</th>
                                                {user?.moderator && <th className="py-3 text-white">User</th>}
                                                <th className="py-3 text-white">Статус</th>                            
                                                <th className="py-3 text-white">Создана</th>
                                                <th className="py-3 text-white">Оформлена</th> 
                                                <th className="py-3 text-white">Результат</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Отображаем list как есть, он уже отфильтрован и обрезан на сервере */}
                                            {list.length > 0 ? list.map((order) => (
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
                                                        <td className="text-light small">ID: {order.creator_id}</td>
                                                    )}
                                                    <td>{getStatusBadge(order.status)}</td>
                                                    
                                                    <td className="text-light opacity-75 small">
                                                        {formatDate(order.creation_date)}
                                                    </td>

                                                    <td className="text-light opacity-75 small">
                                                        {formatDate(order.forming_date)}
                                                    </td>
                                                    
                                                    <td>
                                                        {(order.cooling_power || 0) > 0 ? (
                                                            <span className="fw-bold text-success">
                                                                {order.cooling_power} Вт
                                                            </span>
                                                        ) : (
                                                            <span className="text-secondary small">--</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={user?.moderator ? 6 : 5} className="text-center py-5 text-secondary">
                                                        Заявок не найдено (или фильтр скрыл всё)
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>

                                {/* ПАГИНАЦИЯ */}
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-center mt-4">
                                        <Pagination>
                                            <Pagination.First onClick={() => handlePageChange(1)} disabled={page === 1} />
                                            <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
                                            
                                            {/* Логика отображения номеров страниц */}
                                            {page > 2 && <Pagination.Item onClick={() => handlePageChange(page - 2)}>{page - 2}</Pagination.Item>}
                                            {page > 1 && <Pagination.Item onClick={() => handlePageChange(page - 1)}>{page - 1}</Pagination.Item>}
                                            
                                            <Pagination.Item active>{page}</Pagination.Item>
                                            
                                            {page < totalPages && <Pagination.Item onClick={() => handlePageChange(page + 1)}>{page + 1}</Pagination.Item>}
                                            {page < totalPages - 1 && <Pagination.Item onClick={() => handlePageChange(page + 2)}>{page + 2}</Pagination.Item>}
                                            
                                            <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
                                            <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} />
                                        </Pagination>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <ToastContainer className="p-3" position="bottom-end" style={{ zIndex: 1000 }}>
                    <Toast show={showToast} onClose={() => setShowToast(false)} bg="dark" delay={4000} autohide>
                        <Toast.Header closeButton={false} className="bg-secondary text-white">
                            <ClockHistory className="me-2"/>
                            <strong className="me-auto">Скорость БД</strong>
                        </Toast.Header>
                        <Toast.Body className="text-white">
                            Время выполнения: <strong className="text-warning">{requestTime}</strong>
                        </Toast.Body>
                    </Toast>
                </ToastContainer>

            </Container>
        </div>
    );
};