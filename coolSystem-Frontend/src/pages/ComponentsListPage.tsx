import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Form, Badge, Image, Button } from 'react-bootstrap';
import { ComponentCard } from '../components/ComponentCard';
import { getCartBadge, getComponents } from '../api/componentsApi';
import type { ICartBadge, IComponent } from '../types';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchTerm, selectSearchTerm } from '../store/slices/filterSlice';
import type { AppDispatch } from '../store';
import './styles/ComponentsListPage.css';

const cartImage = `mock_images/cart.png`;

export const ComponentsListPage = () => {
    const [components, setComponents] = useState<IComponent[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartBadge, setCartBadge] = useState<ICartBadge>({ cooling_id: null, count: 0 });
    const dispatch = useDispatch<AppDispatch>();
    const searchTerm = useSelector(selectSearchTerm);

    const fetchComponents = (filterTitle: string) => {
        setLoading(true);
        getComponents(filterTitle)
            .then(data => {
                if (Array.isArray(data.items)) {
                    setComponents(data.items);
                } else {
                    console.error("Получены неверные данные:", data);
                    setComponents([]);
                }
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchComponents(searchTerm);

        getCartBadge().then(cartData => {
            setCartBadge(cartData);
        });
    }, []);

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        fetchComponents(searchTerm);
    };
    const isCartActive = cartBadge.count > 0 && cartBadge.cooling_id !== null;

    return (
        <Container fluid className="components-container pt-5 pb-4 min-vh-100">
            <h1 className="text-white text-center fw-bold fs-2 mb-3">Компоненты серверов</h1>
            <hr className="border-secondary w-75 mx-auto mb-4" />

            <Form onSubmit={handleSearchSubmit}>
                <Row className="mb-4">
                    <Col xs={12} md={10}>
                        <div className="search-and-cart-wrapper">
                            <Form.Control
                                type="search"
                                placeholder="Введите название компонента для поиска..."
                                value={searchTerm}
                                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                                className="search-input"
                            />
                            <Button 
                                variant="dark" 
                                type="submit" 
                                disabled={loading}
                                className="search-btn"
                            >
                                {loading ? 'Поиск...' : 'Искать'}
                            </Button>

                            <div className="cart-wrapper">
                                {isCartActive ? (                               
                                    <a 
                                        href="#" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            alert(`Переход на страницу заявки (ID: ${cartBadge.cooling_id}) будет реализован.`);
                                        }}
                                        title="Перейти к заявке"
                                    >
                                        <Image src={cartImage} alt="Корзина" width={32} />
                                    </a>
                                ) : (                                  
                                    <div style={{ cursor: 'not-allowed' }}>
                                        <Image src={cartImage} alt="Корзина" width={32} style={{ opacity: 0.5 }} />
                                    </div>
                                )}                               
                                {isCartActive && (
                                    <Badge pill bg="danger" className="cart-indicator">
                                        {cartBadge.count}
                                    </Badge>
                                )}
                            </div> 
                        </div>
                    </Col>
                </Row>
            </Form>

            {loading ? (
                <div className="text-center py-4">
                    <Spinner animation="border" variant="light" />
                </div>
            ) : (
                <div className="components-grid-container">
                    <div className="components-grid">
                        {components.map(component => (
                            <ComponentCard key={component.id} component={component} />
                        ))}
                    </div>
                </div>
            )}
        </Container>
    );
};