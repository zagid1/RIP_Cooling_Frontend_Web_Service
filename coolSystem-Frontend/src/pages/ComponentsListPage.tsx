import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Form, Badge, Image, Button } from 'react-bootstrap';
import { ComponentCard } from '../components/ComponentCard';
import { getComponents } from '../api/componentsApi';
import type { IComponent } from '../types';
import './styles/ComponentsListPage.css';

export const ComponentsListPage = () => {
    const [components, setComponents] = useState<IComponent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [cartCount] = useState(1);

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
        fetchComponents('');
    }, []);

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        fetchComponents(searchTerm);
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
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                                <Image 
                                    src="https://cdn-icons-png.flaticon.com/512/2972/2972233.png" 
                                    alt="Корзина" 
                                    width={32}
                                    height={32}
                                />
                                {cartCount > 0 && (
                                    <Badge pill bg="danger" className="cart-indicator">
                                        {cartCount}
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