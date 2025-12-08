import React, { useEffect, useState } from 'react';
import { Container, Table, Form, Badge, Spinner, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOrdersList } from '../store/slices/coolingSlice';
import type { AppDispatch, RootState } from '../store';

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

    const [filters, setFilters] = useState({
        status: 'all',
        from: '',
        to: ''
    });

    useEffect(() => {
        dispatch(fetchOrdersList(filters));
    }, [dispatch, filters]);

    const handleRowClick = (id: number | undefined) => {
        if (id) navigate(`/orders/${id}`);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        // Общий фон страницы - черный
        <div className="min-vh-100 bg-black pb-5">
            <Container className="pt-5 mt-5">
                <h2 className="fw-bold mb-4 text-center text-white">История заявок</h2>

                {/* Карточка фильтров: темно-серая, без границ, flexbox вместо Row/Col */}
                <Card className="mb-4 border-0 shadow text-white" style={{ backgroundColor: '#343a40' }}>
                    <Card.Body>
                        {/* Flex контейнер для фильтров */}
                        <div className="d-flex flex-column flex-md-row gap-3">
                            <div className="flex-fill">
                                <Form.Label className="text-light fw-medium">Статус</Form.Label>
                                <Form.Select 
                                    name="status" 
                                    value={filters.status} 
                                    onChange={handleFilterChange}
                                    className="bg-dark text-white border-secondary"
                                >
                                    <option value="all">Любой статус</option>
                                    <option value="3">В работе (Сформирована)</option>
                                    <option value="4">Завершена</option>
                                    <option value="5">Отклонена</option>
                                </Form.Select>
                            </div>
                            <div className="flex-fill">
                                <Form.Label className="text-light fw-medium">Дата оформления (от)</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    name="from" 
                                    value={filters.from} 
                                    onChange={handleFilterChange}
                                    className="bg-dark text-white border-secondary"
                                />
                            </div>
                            <div className="flex-fill">
                                <Form.Label className="text-light fw-medium">Дата оформления (до)</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    name="to" 
                                    value={filters.to} 
                                    onChange={handleFilterChange}
                                    className="bg-dark text-white border-secondary"
                                />
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {loading ? (
                    <div className="text-center pt-5">
                        <Spinner animation="border" variant="light" />
                    </div>
                ) : (
                    <div className="table-responsive shadow rounded">
                        {/* Темная таблица (variant="dark") */}
                        <Table hover variant="dark" className="align-middle mb-0">
                            <thead>
                                <tr style={{ borderBottom: '2px solid #6c757d' }}>
                                    <th className="py-3 text-white">#</th>
                                    <th className="py-3 text-white">Статус</th>                            
                                    <th className="py-3 text-white">Дата создания</th>
                                    <th className="py-3 text-white">Дата оформления</th> 
                                    <th className="py-3 text-white">Дата завершения</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(list || []).length > 0 ? (list || []).map((order) => (
                                    <tr 
                                        key={order.id} 
                                        onClick={() => handleRowClick(order.id)} 
                                        style={{ cursor: 'pointer', borderBottom: '1px solid #495057' }}
                                    >
                                        <td className="fw-bold text-white">{order.id}</td>
                                        <td>{getStatusBadge(order.status)}</td>
                                        
                                        <td className="text-light opacity-75">
                                            {order.creation_date 
                                                ? new Date(order.creation_date).toLocaleString('ru-RU') 
                                                : <span className="text-secondary">--</span>}
                                        </td>

                                        <td className="text-light opacity-75">
                                            {order.forming_date 
                                                ? new Date(order.forming_date).toLocaleString('ru-RU') 
                                                : <span className="text-secondary">--</span>}
                                        </td>
                                        <td className="text-light opacity-75">
                                            {order.completion_date 
                                                ? new Date(order.completion_date).toLocaleString('ru-RU') 
                                                : <span className="text-secondary">--</span>}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-5 text-secondary">
                                            Заявок не найдено
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                )}
            </Container>
        </div>
    );
};