import React, { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Spinner, Image, InputGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchComponents, 
    createComponent, 
    updateComponent, 
    deleteComponent, 
    uploadComponentImage 
} from '../store/slices/componentsSlice';
import { PlusLg, PencilSquare, Trash, ArrowLeft, Save, Upload } from 'react-bootstrap-icons';
import type { AppDispatch, RootState } from '../store';
import type { IComponent } from '../types';

// Заглушка для изображения
const DefaultImage = '/mock_images/default.png';

export const ComponentsAdminPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    
    // Используем items из стейта
    const { items, loading } = useSelector((state: RootState) => state.components);

    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingId, setEditingId] = useState<number | null>(null);

    // Состояние формы
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tdp: 0,
        imageUrl: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        // Загружаем список при монтировании (без фильтра)
        dispatch(fetchComponents(undefined));
    }, [dispatch]);

    // --- ОБРАБОТЧИКИ ---

    const handleCreate = () => {
        setEditingId(null);
        setFormData({ title: '', description: '', tdp: 0, imageUrl: '' });
        setImageFile(null);
        setView('form');
    };

    const handleEdit = (component: IComponent) => {
        setEditingId(component.id);
        setFormData({
            title: component.title || '',
            description: component.description || '',
            tdp: component.tdp || 0,
            imageUrl: component.image_url || ''
        });
        setImageFile(null);
        setView('form');
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить этот компонент?')) {
            await dispatch(deleteComponent(id));
            // Список обновится через extraReducers, но можно перезапросить для надежности:
            // dispatch(fetchComponents(undefined));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Подготовка данных. Важно: API ожидает поля, совместимые с DsComponentCreateRequest/UpdateRequest
        const payload = {
            title: formData.title,
            description: formData.description,
            tdp: Number(formData.tdp),
            image_url: formData.imageUrl 
        };

        try {
            let targetId = editingId;

            if (editingId) {
                // --- РЕДАКТИРОВАНИЕ ---
                await dispatch(updateComponent({ id: editingId, data: payload })).unwrap();
            } else {
                // --- СОЗДАНИЕ ---
                const resultAction = await dispatch(createComponent(payload)).unwrap();
                // Получаем ID созданного объекта
                if (resultAction && resultAction.id) {
                    targetId = resultAction.id;
                }
            }

            // --- ЗАГРУЗКА ФОТО (если есть файл и есть ID) ---
            if (targetId && imageFile) {
                await dispatch(uploadComponentImage({ id: targetId, file: imageFile })).unwrap();
            }

            // После всех операций обновляем список и закрываем форму
            dispatch(fetchComponents(undefined));
            setView('list');
        } catch (error) {
            console.error("Ошибка сохранения:", error);
            alert("Произошла ошибка при сохранении данных.");
        }
    };


    // === РЕНДЕР: ФОРМА РЕДАКТИРОВАНИЯ ===
    if (view === 'form') {
        return (
            <div className="min-vh-100 bg-black pb-5">
                <Container className="pt-5 mt-5" style={{ maxWidth: '600px' }}> {/* Уменьшили ширину */}
                    <div className="d-flex align-items-center mb-3">
                        <Button 
                            variant="outline-secondary" 
                            size="sm"
                            className="me-3 border-0" 
                            onClick={() => setView('list')}
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <h4 className="fw-bold text-white m-0">
                            {editingId ? 'Редактирование' : 'Создание'}
                        </h4>
                    </div>

                    <Card className="shadow border-0 text-white" style={{ backgroundColor: '#212529', border: '1px solid #343a40' }}>
                        <Card.Body className="p-3"> {/* Уменьшили внутренние отступы */}
                            <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                                
                                {/* ПЕРВАЯ СТРОКА: Название + TDP (экономим высоту) */}
                                <div className="d-flex gap-3">
                                    <Form.Group className="flex-grow-1">
                                        <Form.Label className="text-white-50 small mb-1">Название</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            required
                                            className="bg-dark text-white border-secondary shadow-none"
                                            placeholder="Название процессора"
                                        />
                                    </Form.Group>

                                    <Form.Group style={{ width: '120px' }}>
                                        <Form.Label className="text-white-50 small mb-1">TDP (Вт)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            // Если 0, показываем пустую строку для удобства ввода
                                            value={formData.tdp === 0 ? '' : formData.tdp}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                // Разрешаем пустую строку, иначе парсим в число
                                                setFormData({
                                                    ...formData, 
                                                    tdp: val === '' ? 0 : Number(val) // В стейт пишем 0, если пусто, но value инпута обработает это
                                                })
                                            }}
                                            required
                                            className="bg-dark text-white border-secondary shadow-none text-center"
                                            placeholder="0"
                                        />
                                    </Form.Group>
                                </div>

                                {/* ВТОРАЯ СТРОКА: Изображение */}
                                <Form.Group>
                                    <Form.Label className="text-white-50 small mb-1">Изображение</Form.Label>
                                    <InputGroup size="sm">
                                        <Form.Control 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="bg-dark text-white border-secondary shadow-none"
                                        />
                                        <InputGroup.Text className="bg-secondary border-secondary text-white">
                                            <Upload size={14} />
                                        </InputGroup.Text>
                                    </InputGroup>
                                    {/* Статус файла одной строкой */}
                                    <div className="text-end mt-1">
                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            {imageFile 
                                                ? <span className="text-success">{imageFile.name}</span> 
                                                : (formData.imageUrl ? 'Сохранено текущее фото' : 'Нет фото')
                                            }
                                        </small>
                                    </div>
                                </Form.Group>

                                {/* ТРЕТЬЯ СТРОКА: Описание */}
                                <Form.Group>
                                    <Form.Label className="text-white-50 small mb-1">Описание</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4} // Уменьшили высоту текстового поля
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="bg-dark text-white border-secondary shadow-none"
                                        style={{ resize: 'none' }} 
                                    />
                                </Form.Group>

                                {/* КНОПКИ */}
                                <div className="d-flex justify-content-end gap-2 pt-2 border-top border-secondary">
                                    <Button variant="link" onClick={() => setView('list')} className="text-decoration-none text-light opacity-75">
                                        Отмена
                                    </Button>
                                    <Button variant="success" type="submit" size="sm" className="px-4 fw-bold">
                                        <Save className="me-2"/>
                                        Сохранить
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Container>
            </div>
        );
    }


    // === РЕНДЕР: СПИСОК ===
    return (
        <div className="min-vh-100 bg-black pb-5">
            <Container className="pt-5 mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold text-white m-0">Управление компонентами</h2>
                    <Button variant="light" onClick={handleCreate} className="d-flex align-items-center gap-2 fw-bold">
                        <PlusLg /> Добавить
                    </Button>
                </div>

                {loading && items.length === 0 ? (
                    <div className="text-center pt-5">
                        <Spinner animation="border" variant="light" />
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {items && items.map((comp) => (
                            <Card key={comp.id} className="border-0 shadow text-white" style={{ backgroundColor: '#343a40' }}>
                                <Card.Body className="p-2">
                                    <div className="d-flex align-items-center">
                                        {/* Картинка с фолбэком */}
                                        <div className="me-3" style={{ width: 80, height: 80, flexShrink: 0 }}>
                                            <Image 
                                                src={comp.image_url || DefaultImage} 
                                                fluid 
                                                rounded 
                                                className="bg-dark"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = DefaultImage;
                                                }}
                                            />
                                        </div>

                                        {/* Текст */}
                                        <div className="flex-grow-1 pe-3">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <h5 className="fw-bold mb-1 text-white">{comp.title}</h5>
                                                <span className="badge bg-secondary">TDP: {comp.tdp} Вт</span>
                                            </div>
                                            <p className="text-light opacity-75 small mb-0 text-truncate" style={{ maxWidth: '600px' }}>
                                                {comp.description}
                                            </p>
                                        </div>

                                        {/* Кнопки */}
                                        <div className="d-flex flex-column gap-2 border-start border-secondary ps-3 my-1">
                                            <Button 
                                                variant="outline-light" 
                                                size="sm" 
                                                className="d-flex align-items-center gap-2"
                                                onClick={() => handleEdit(comp)}
                                            >
                                                <PencilSquare /> <span className="d-none d-md-inline">Изменить</span>
                                            </Button>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm" 
                                                className="d-flex align-items-center gap-2"
                                                onClick={() => handleDelete(comp.id)}
                                            >
                                                <Trash /> <span className="d-none d-md-inline">Удалить</span>
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}

                        {items && items.length === 0 && (
                            <div className="text-center text-muted py-5 border border-secondary rounded border-dashed">
                                Список компонентов пуст
                            </div>
                        )}
                    </div>
                )}
            </Container>
        </div>
    );
};