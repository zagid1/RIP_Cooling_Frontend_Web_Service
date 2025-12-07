// Navbar.tsx
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PersonCircle, BoxArrowRight } from 'react-bootstrap-icons';
import { logoutUser } from '../store/slices/userSlice';
import { deleteOrder } from '../store/slices/coolingSlice'; 
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
                await dispatch(deleteOrder(cooling_id)).unwrap();
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
        // collapseOnSelect - заставляет меню закрываться при выборе пункта
        <Navbar className="custom-navbar" sticky="top" expand="lg" variant="dark" collapseOnSelect>
            <Container fluid className='px-4'>
                <Navbar.Brand className='nav-brand d-flex align-items-center' as={Link} to="/">
                    CoolingSystems.org
                </Navbar.Brand>
                
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />

                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="ms-auto align-items-lg-center align-items-start">
                        {/* eventKey нужен для корректной работы collapseOnSelect, если as={Link} */}
                        <Nav.Link eventKey="components" className='nav-link d-flex align-items-center' as={Link} to="/components">
                            Компоненты сервера
                        </Nav.Link>

                        {isAuthenticated ? (
                            <>
                                <Nav.Link eventKey="cooling" as={Link} to="/cooling" className="nav-link text-white">
                                    Мои заявки
                                </Nav.Link>

                                {/* d-none d-lg-flex: Скрыто на мобильных, Flex на больших экранах */}
                                <div className="nav-del d-none d-lg-flex align-items-center px-2">|</div>

                                <Nav.Link eventKey="profile" as={Link} to="/profile" className="nav-link text-white d-flex align-items-center gap-2">
                                    <PersonCircle size={20} />
                                    <span className="fw-bold">
                                        {user?.username || user?.full_name || 'Пользователь'}
                                    </span>
                                </Nav.Link>

                                {/* Оборачиваем кнопку в Nav.Link или div, чтобы стили работали корректно в потоке */}
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
                                {/* d-none d-lg-flex: Скрыто на мобильных */}
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