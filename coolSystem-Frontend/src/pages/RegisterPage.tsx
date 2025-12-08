import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError, resetRegisterSuccess } from '../store/slices/userSlice';
import { PersonPlus } from 'react-bootstrap-icons';
import type { AppDispatch, RootState } from '../store';
import './styles/main.css';

export const RegisterPage = () => {
    const [formData, setFormData] = useState({ full_name: '', username: '', password: '' });
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error, registerSuccess } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        dispatch(clearError());
        dispatch(resetRegisterSuccess());
    }, [dispatch]);

    useEffect(() => {
        if (registerSuccess) {
            alert("Регистрация успешна! Теперь войдите.");
            navigate('/login');
        }
    }, [registerSuccess, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(registerUser(formData));
    };

    return (
        // Изменен фон на черный (bg-black)
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-black">
            <Container style={{ maxWidth: '450px' }}>
                {/* Карточка теперь темная (bg-dark) с белым текстом и серой границей */}
                <Card className="shadow rounded-4 bg-dark text-white border border-secondary">
                    <Card.Body className="p-5">
                        <div className="text-center mb-4">
                            <h2 className="fw-bold text-white">Регистрация</h2>
                            <p className="text-secondary">Создайте новый аккаунт</p>
                        </div>

                        {error && <Alert variant="secondary" className="bg-secondary text-white border-0">{error}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <Form.Floating className="mb-3">
                                <Form.Control
                                    id="fullName"
                                    type="text"
                                    placeholder="ФИО"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    required
                                    // Стили для темного инпута
                                    className="bg-dark text-white border-secondary"
                                />
                                <label htmlFor="fullName" className="text-secondary">ФИО</label>
                            </Form.Floating>

                            <Form.Floating className="mb-3">
                                <Form.Control
                                    id="username"
                                    type="text"
                                    placeholder="Логин"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
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
                                {loading ? <Spinner size="sm" animation="border" /> : <><PersonPlus size={20}/> Создать аккаунт</>}
                            </Button>
                        </Form>

                        <div className="text-center mt-4">
                            <span className="text-secondary">Уже есть аккаунт? </span>
                            {/* Ссылка теперь белая */}
                            <Link to="/login" className="text-white fw-bold text-decoration-none">
                                Войти
                            </Link>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};