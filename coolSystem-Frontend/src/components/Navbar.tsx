import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
// Добавили иконку Tools
import { PersonCircle, BoxArrowRight, Tools } from 'react-bootstrap-icons';
import { logoutUser } from '../store/slices/userSlice';
import { deleteCooling } from '../store/slices/coolingSlice'; 
import { fetchCartBadge } from '../store/slices/cartSlice';
import type { RootState, AppDispatch } from '../store';
import './styles/Navbar.css'

export const AppNavbar = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.user);
    const { cooling_id } = useSelector((state: RootState) => state.cart);
 
    const handleLogout = async () => { 
        if (cooling_id) {
            try {
                await dispatch(deleteCooling(cooling_id)).unwrap();
                console.log(`Черновик ${cooling_id} был автоматически удален при выходе.`);
            } catch (e) {
                console.error("Не удалось удалить черновик при выходе", e);
            }
        }
        dispatch(logoutUser())
            .then(() => {
                dispatch(fetchCartBadge());
                navigate('/components');
            });
    };

    return (
        <Navbar className="custom-navbar" sticky="top" expand="lg" variant="dark" collapseOnSelect>
            <Container fluid className='px-4'>
                <Navbar.Brand className='nav-brand d-flex align-items-center' as={Link} to="/">
                    CoolingSystems.org
                </Navbar.Brand>
                
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />

                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="ms-auto align-items-lg-center align-items-start">
                        <Nav.Link eventKey="components" className='nav-link d-flex align-items-center' as={Link} to="/components">
                            Компоненты сервера
                        </Nav.Link>

                        {isAuthenticated ? (
                            <>
                                <Nav.Link as={Link} to="/cooling" className="nav-link text-white">
                                    Заявки
                                </Nav.Link>

                                {/* --- КНОПКА МОДЕРАТОРА --- */}
                                {user?.moderator && (
                                    <Nav.Link 
                                        eventKey="admin-components" 
                                        as={Link} 
                                        // Укажите здесь путь к вашей ComponentsAdminPage
                                        to="/moderator/components" 
                                        className="nav-link text-warning d-flex align-items-center gap-1"
                                        title="Редактирование компонентов"
                                    >
                                        <Tools size={16} />
                                        <span>Панель редактирования</span>
                                    </Nav.Link>
                                )}
                                {/* ------------------------- */}

                                <div className="nav-del d-none d-lg-flex align-items-center px-2">|</div>

                                <Nav.Link eventKey="profile" as={Link} to="/profile" className="nav-link text-white d-flex align-items-center gap-2">
                                    <PersonCircle size={20} />
                                    <span className="fw-bold">
                                        {user?.username || user?.full_name || 'Пользователь'}
                                    </span>
                                </Nav.Link>

                                <div className="nav-item mt-2 mt-lg-0">
                                    <Button 
                                        variant="outline-light" 
                                        size="sm" 
                                        onClick={handleLogout}
                                        className="d-flex align-items-center px-3 w-100 justify-content-start justify-content-lg-center"
                                    >
                                        <BoxArrowRight className="me-2"/> Выход
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="nav-del d-none d-lg-flex align-items-center px-2">|</div>
                                
                                <Nav.Link eventKey="login" as={Link} to="/login" className="nav-link text-white">
                                    Вход
                                </Nav.Link>
                                
                                <Nav.Link eventKey="register" as={Link} to="/register" className="p-0 ms-lg-2 mt-2 mt-lg-0">
                                    <Button className="nav-link d-flex align-items-center justify-content-center px-3 w-100">
                                        Регистрация
                                    </Button>
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};