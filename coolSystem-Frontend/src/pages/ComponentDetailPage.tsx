// ComponentDetailPage.tsx
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { DefaultImage } from '../components/ComponentCard';
import { CustomBreadcrumbs } from '../components/Breadcrumbs';
import { fetchComponentById, clearCurrentComponent } from '../store/slices/componentsSlice';
import type { RootState, AppDispatch } from '../store';
import './styles/ComponentDetailPage.css';

export const ComponentDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { currentComponent: component, loading } = useSelector((state: RootState) => state.components);
    const displayImage = component?.image_url || DefaultImage;

     useEffect(() => {
        if (id) {
            dispatch(fetchComponentById(id));
        }
        return () => {
            dispatch(clearCurrentComponent());
        };
    }, [id, dispatch]);

    

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
                    </Col>
                </Row>
            </Container>
        </div>
    );
};