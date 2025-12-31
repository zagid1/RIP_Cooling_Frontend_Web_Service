import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Compass, HouseDoorFill, ShieldLockFill, ExclamationTriangleFill } from 'react-bootstrap-icons';
import './styles/ErrorPages.css';

// --- СТРАНИЦА 404 (Не найдено) ---
export const NotFoundPage = () => {
  return (
    <div className="error-page-container">
      <div className="error-card">
        {/* 1. Иконка */}
        <div className="error-icon-wrapper text-primary">
          <Compass size={50} />
        </div>

        {/* 2. Читаемая цифра (Синяя) */}
        <div className="error-code text-glow-blue">404</div>
        
        {/* 3. Текст */}
        <h2 className="error-title">Страница не найдена</h2>
        <p className="error-desc">
          Мы не смогли найти запрашиваемую страницу. Возможно, адрес введен неверно или страница была удалена.
        </p>
        
        {/* 4. Кнопка */}
        <Link to="/">
          <Button variant="outline-light" className="error-btn">
            <HouseDoorFill className="me-2" /> На главную
          </Button>
        </Link>
      </div>
    </div>
  );
};