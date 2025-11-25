// Navbar.tsx
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PersonCircle, BoxArrowRight } from 'react-bootstrap-icons';
import { logoutUser } from '../store/slices/userSlice';
import { deleteOrder } from '../store/slices/fraxSlice'; 
import { fetchCartBadge } from '../store/slices/cartSlice';
import './styles/Navbar.css'

export const AppNavbar = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.user);
    const { component_id } = useSelector((state: RootState) => state.cart);

    const handleLogout = async () => {
        if (component_id) {
            try {
                await dispatch(deleteOrder(component_id)).unwrap();
                console.log(`Черновик ${component_id} был автоматически удален при выходе.`);
            } catch (e) {
                console.error("Не удалось удалить черновик при выходе", e);
            }
        }
        dispatch(logoutUser())
            .then(() => {
                dispatch(fetchCartBadge());
                navigate('/login');
            });
    };

    return (
        <Navbar className="custom-navbar" sticky="top">
            <Container fluid className='px-7 h-100'>
                <Navbar.Brand className='nav-brand h-100 d-flex align-items-center' as={Link} to="/">
                    CoolingSystems.org
                </Navbar.Brand>
                <Nav className="ms-auto h-100">
                    <Nav.Link className='nav-link h-100 d-flex align-items-center px-3' as={Link} to="/components">
                        Компоненты сервера
                    </Nav.Link>

                     {isAuthenticated ? (
                            <>
                                <Nav.Link as={Link} to="/orders" className="text-white">
                                    Мои заявки
                                </Nav.Link>

                                <div className="text-white mx-2 d-none d-lg-block">|</div>

                                <Nav.Link as={Link} to="/profile" className="text-white d-flex align-items-center gap-2">
                                    <PersonCircle size={20} />
                                    <span className="fw-bold">
                                        {user?.username || user?.full_name || 'Пользователь'}
                                    </span>
                                </Nav.Link>

                                <Button 
                                    variant="outline-light" 
                                    size="sm" 
                                    onClick={handleLogout}
                                    className="d-flex align-items-center gap-2"
                                >
                                    <BoxArrowRight /> Выход
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="text-white mx-2 d-none d-lg-block">|</div>
                                <Nav.Link as={Link} to="/login" className="text-white">
                                    Вход
                                </Nav.Link>
                                <Link to="/register">
                                    <Button variant="light" className="text-danger fw-bold">
                                        Регистрация
                                    </Button>
                                </Link>
                            </>
                        )}
                </Nav>
            </Container>
        </Navbar>
    );
};