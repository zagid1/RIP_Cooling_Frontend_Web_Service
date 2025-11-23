// ComponentCard.tsx
//import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { IComponent } from '../types';
import './styles/ComponentCard.css'

export const DefaultImage = `/mock_images/default.webp`;

interface ComponentCardProps {
    component: IComponent;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({ component }) => {
    // const imageSrc = component.image_url
    // ? `${import.meta.env.BASE_URL}${component.image_url}` // Добавляем префикс к картинке из component
    // : DefaultImage;
    const imageSrc = component.image_url || DefaultImage;

    // Вывод в консоль для проверки
    // console.log('Исходный URL:', component.image_url);
    // console.log('BASE_URL:', import.meta.env.BASE_URL);
    // console.log('Итоговый путь:', imageSrc);
    return (
        <div className="component-card">
            <div className="component-image">
                <img src={imageSrc} alt={component.title} />
            </div>
            <div className="component-info">
                <h3>{component.title}</h3>
                <p className="tdp">TDP: {component.tdp || 'N/A'} Вт</p>
                <div className="buttons-container">
                    {/* <form action={`/cooling/draft/components/${component.id}`} method="POST" className="button-form"> */}
                        <button className="apply-btn" type="submit">добавить</button>
                    {/* </form> */}
                    <Link to={`/components/${component.id}`} className="apply-btn">подробнее</Link>
                </div>
            </div>
        </div>
    );
};