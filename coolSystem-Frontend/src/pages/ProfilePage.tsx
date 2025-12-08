import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Badge } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PersonCircle, PencilSquare, CheckLg, XLg, BoxArrowRight } from 'react-bootstrap-icons';
import { updateUserProfile, logoutUser } from '../store/slices/userSlice';
import type { RootState, AppDispatch } from '../store';
import './styles/main.css';

export const ProfilePage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user, token } = useSelector((state: RootState) => state.user);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ full_name: '', username: '', password: '' });

    useEffect(() => {
        if (!token) navigate('/login');
    }, [token, navigate]);

    useEffect(() => {
        if (user) {
            setEditData({
                full_name: user.full_name || '',
                username: user.username || '',
                password: '',
            });
        }
    }, [user]);

    const handleSave = () => {
        if (user?.id) {
            dispatch(updateUserProfile({ id: user.id, data: editData }))
            .unwrap()
            .then(() => {
                setIsEditing(false);
                setEditData(prev => ({ ...prev, password: '' }));
                alert('Профиль обновлен!');
            })
            .catch((err) => alert(`Ошибка: ${err}`));
        }
    };

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({
            full_name: user?.full_name || '', 
            username: user?.username || '', 
            password: ''
        });
    };

    if (!user) return null;

    return (
        // Фон страницы черный
        <div className="min-vh-100 bg-black">
            {/* Используем flex для центрирования вместо Row/Col */}
            <Container className="pt-5 mt-5 d-flex justify-content-center">
                {/* Обертка для ограничения ширины карточки (аналог Col lg={8}) */}
                <div style={{ width: '100%', maxWidth: '800px' }}>
                    
                    {/* Карточка: Сплошной серый цвет (#343a40), без границ */}
                    <Card className="shadow rounded-4 text-white border-0" style={{ backgroundColor: '#343a40' }}>
                        
                        <Card.Header className="bg-transparent border-0 pt-4 pb-0 px-4 d-flex justify-content-between align-items-center">
                            <h3 className="fw-bold mb-0 text-white">Личный кабинет</h3>
                            {user.moderator && (
                                <Badge bg="warning" text="dark" className="fs-6">
                                    MODERATOR
                                </Badge>
                            )}
                        </Card.Header>
                        
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-4 pb-4 border-bottom border-secondary">
                                <div className="me-4">
                                    <PersonCircle size={80} color="white" />
                                </div>
                                <div>
                                    <h4 className="fw-bold mb-1 text-white">{user.full_name}</h4>
                                    <p className="text-light opacity-75 mb-0">@{user.username}</p>
                                    <p className="text-light opacity-50 small">ID: {user.id}</p>
                                </div>
                            </div>

                            <Form>
                                {/* Замена Row/Col для полей ввода на Flexbox */}
                                <div className="d-flex flex-column flex-md-row gap-3 mb-3">
                                    <Form.Group className="w-100">
                                        <Form.Label className="text-light fw-medium">ФИО</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={isEditing ? editData.full_name : user.full_name || ''}
                                            onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                                            disabled={!isEditing}
                                            className={`bg-dark text-white border-0 ${isEditing ? 'border-bottom border-danger rounded-0' : ''}`}
                                            style={{ backgroundColor: '#212529' }}
                                        />
                                    </Form.Group>
                                    
                                    <Form.Group className="w-100">
                                        <Form.Label className="text-light fw-medium">Логин</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={isEditing ? editData.username : user.username || ''}
                                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                            disabled={!isEditing}
                                            className={`bg-dark text-white border-0 ${isEditing ? 'border-bottom border-danger rounded-0' : ''}`}
                                            style={{ backgroundColor: '#212529' }}
                                        />
                                    </Form.Group>
                                </div>

                                <Form.Group className="mb-3">
                                    <Form.Label className="text-light fw-medium">
                                        {isEditing ? 'Новый пароль' : 'Пароль'}
                                    </Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={isEditing ? editData.password : '********'}
                                        placeholder={isEditing ? 'Введите новый пароль для изменения' : ''}
                                        onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                                        disabled={!isEditing}
                                        className={`bg-dark text-white border-0 ${isEditing ? 'border-bottom border-danger rounded-0' : ''}`}
                                        style={{ backgroundColor: '#212529' }}
                                    />
                                    {isEditing && (
                                        <Form.Text className="text-light opacity-75">
                                            Оставьте пустым, если не хотите менять пароль.
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                <div className="d-flex justify-content-between align-items-center mt-5">
                                    <div>
                                        {!isEditing ? (
                                            <Button 
                                                variant="light" 
                                                onClick={() => setIsEditing(true)}
                                                className="d-flex align-items-center gap-2"
                                            >
                                                <PencilSquare /> Редактировать
                                            </Button>
                                        ) : (
                                            <div className="d-flex gap-2">
                                                <Button 
                                                    variant="success" 
                                                    onClick={handleSave}
                                                    className="d-flex align-items-center gap-2"
                                                >
                                                    <CheckLg /> Сохранить
                                                </Button>
                                                <Button 
                                                    variant="outline-light" 
                                                    onClick={handleCancel}
                                                    className="d-flex align-items-center gap-2"
                                                >
                                                    <XLg /> Отмена
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Кнопка выхода белая (variant="light") */}
                                    <Button 
                                        variant="light" 
                                        onClick={handleLogout}
                                        className="d-flex align-items-center gap-2 fw-bold"
                                    >
                                        <BoxArrowRight /> Выйти из аккаунта
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        </div>
    );
};