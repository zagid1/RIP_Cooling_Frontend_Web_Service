import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Form, Badge, Image, Button } from 'react-bootstrap';
import { ComponentCard } from '../components/ComponentCard';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; 
import { fetchFactors } from '../store/slices/factorsSlice';
import { fetchCartBadge } from '../store/slices/cartSlice';
import { setSearchTerm } from '../store/slices/filterSlice';
import type { RootState, AppDispatch } from '../store';

import './styles/ComponentsListPage.css';

const cartImage = `/mock_images/cart.png`;  

export const ComponentsListPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { items: components, loading } = useSelector((state: RootState) => state.components);
    const searchTerm = useSelector((state: RootState) => state.filter.searchTerm);
    const cartState = useSelector((state: RootState) => state.cart);
    const isCartActive = cartState.count > 0 && cartState.component_id !== null;
    
    useEffect(() => {
        dispatch(fetchFactors(searchTerm));
        dispatch(fetchCartBadge());
    }, [dispatch]);

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault(); 
        dispatch(fetchFactors(searchTerm));
    };

    const handleCartClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (cartState.frax_id) {
            navigate(`/orders/${cartState.frax_id}`);
        }
    };

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
                                        onClick={handleCartClick}
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
                                        {cartState.count}
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