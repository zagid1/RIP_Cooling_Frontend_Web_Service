// ComponentDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getComponentById } from '../api/componentsApi';
import type { IComponent } from '../types';
import { DefaultImage } from '../components/ComponentCard';
import { CustomBreadcrumbs } from '../components/Breadcrumbs';
import './styles/ComponentDetailPage.css';

export const ComponentDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [component, setComponent] = useState<IComponent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            setLoading(true);
            getComponentById(id)
                .then(data => setComponent(data))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const displayImage = component?.image_url  
    ? `${import.meta.env.BASE_URL}${component.image_url}` // Добавляем префикс к картинке из component
    : DefaultImage;

    if (loading) {
        return (
            <div className="min-vh-100 d-flex justify-content-center align-items-center">
                <Spinner animation="border" variant="light" style={{ width: '3rem', height: '3rem' }} />
            </div>
        );
    }

    if (!component) {
        return (
            <Container className="text-white min-vh-100 d-flex flex-column justify-content-center align-items-center">
                <h2>Компонент не найден</h2>
                <Link to="/components">
                    <Button variant="outline-light" className="mt-3 rounded-2">Вернуться к списку</Button>
                </Link>
            </Container>
        );
    }

    const breadcrumbs = [
        { label: 'Компоненты серверов', path: '/components' },
        { label: component.title, active: true },
    ];

    return (
        <div className="component-detail-page min-vh-100">
            <div className="component-background" />
            {/* ЗДЕСЬ ИЗМЕНИЛ КЛАСС НА component-detail-container */}
            <Container fluid className="component-detail-container">
                <div className="mb-4">
                    <CustomBreadcrumbs crumbs={breadcrumbs} />
                </div>
                <Row className="g-4">
                    <Col lg={3} className="">
                        <div className="component-image-wrapper rounded-3 d-flex justify-content-start align-items-center">
                            <img src={displayImage} alt={component.title} className="component-main-image rounded-2" />
                        </div>
                    </Col>
                    <Col lg={7} className="component-info-wrapper">
                        <div className="component-header">
                            <h1 className="component-title text-white fw-bold mb-4">{component.title}</h1>
                            <div className="component-description mb-5">
                                <p className="description-text">{component.description}</p>
                            </div>                
                        </div>
                        <div className="component-actions">
                            <Button className='add-to-calc-btn rounded-2 px-4 py-3 fw-semibold'>
                                Добавить в расчет
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};