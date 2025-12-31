import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ShieldLockFill } from 'react-bootstrap-icons';
import './styles/ErrorPages.css';

// --- СТРАНИЦА 403 (Доступ запрещен) ---
export const ForbiddenPage = () => {
  return (
    <div className="error-page-container">
      <div className="error-card">
        {/* 1. Иконка */}
        <div className="error-icon-wrapper text-danger">
          <ShieldLockFill size={50} />
        </div>

        {/* 2. Читаемая цифра (Красная) */}
        <div className="error-code text-glow-red">403</div>
        
        {/* 3. Текст */}
        <h2 className="error-title">Доступ запрещен</h2>
        <p className="error-desc">
          У вас недостаточно прав для просмотра этого раздела. 
          Пожалуйста, войдите как администратор.
        </p>
        
        {/* 4. Кнопки */}
        <div className="d-flex gap-3">
          <Link to="/">
            <Button variant="outline-light" className="error-btn">
              Главная
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};