import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/slices/userSlice';
import type { AppDispatch, RootState } from '../store';
import { BoxArrowInRight } from 'react-bootstrap-icons';
import './styles/main.css';

export const LoginPage = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/components');
        }
        dispatch(clearError());
    }, [isAuthenticated, navigate, dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(loginUser(formData)).unwrap();
            navigate('/components');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        // Изменен фон на черный (bg-black)
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-black">
            <Container style={{ maxWidth: '400px' }}>
                {/* Карточка теперь темная (bg-dark) с белым текстом и серой границей */}
                <Card className="shadow rounded-4 bg-dark text-white border border-secondary">
                    <Card.Body className="p-5">
                        <div className="text-center mb-4">
                            <h2 className="fw-bold text-white">Вход</h2>
                            <p className="text-secondary">Пользователь в системе CoolingSystem</p>
                        </div>

                        {error && <Alert variant="secondary" className="text-center bg-secondary text-white border-0">{error}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <Form.Floating className="mb-3">
                                <Form.Control
                                    id="username"
                                    type="text"
                                    placeholder="Логин"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    // Стили для темного инпута
                                    className="bg-dark text-white border-secondary"
                                />
                                <label htmlFor="username" className="text-secondary">Логин</label>
                            </Form.Floating>

                            <Form.Floating className="mb-4">
                                <Form.Control
                                    id="password"
                                    type="password"
                                    placeholder="Пароль"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="bg-dark text-white border-secondary"
                                />
                                <label htmlFor="password" className="text-secondary">Пароль</label>
                            </Form.Floating>

                            <Button 
                                variant="light" // Кнопка теперь светлая/серая
                                type="submit" 
                                className="w-100 py-3 fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2"
                                disabled={loading}
                            >
                                {loading ? <Spinner size="sm" animation="border" /> : <><BoxArrowInRight size={20}/> Войти</>}
                            </Button>
                        </Form>

                        <div className="text-center mt-4">
                            <span className="text-secondary">Нет аккаунта? </span>
                            {/* Ссылка теперь белая */}
                            <Link to="/register" className="text-white fw-bold text-decoration-none">
                                Зарегистрироваться
                            </Link>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};