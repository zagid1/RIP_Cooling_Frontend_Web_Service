// Navbar.tsx
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './styles/Navbar.css'

export const AppNavbar = () => {
    return (
        <Navbar className="custom-navbar" sticky="top" style={{ height: '80px' }}>
            <Container fluid className='px-7 h-100'>
                <Navbar.Brand className='nav-brand h-100 d-flex align-items-center' as={Link} to="/">
                    CoolingSystems.org
                </Navbar.Brand>
                <Nav className="ms-auto h-100">
                    <Nav.Link className='nav-link h-100 d-flex align-items-center px-3' as={Link} to="/components">
                        Компоненты сервера
                    </Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    );
};