// ComponentCard.tsx
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { IComponent } from '../types';
import './styles/ComponentCard.css'

import DefaultImageCard from './pictures/default.webp';
export const DefaultImage = DefaultImageCard;

interface ComponentCardProps {
    component: IComponent;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({ component }) => {
    return (
        <div className="component-card">
            <div className="component-image">
                <img src={component.image_url || DefaultImage} alt={component.title} />
            </div>
            <div className="component-info">
                <h3>{component.title}</h3>
                <p className="tdp">TDP: {component.tdp || 'N/A'} Вт</p>
                <div className="buttons-container">
                    <form action={`/cooling/add/Component/${component.id}`} method="POST" className="button-form">
                        <button className="apply-btn" type="submit">добавить</button>
                    </form>
                    <Link to={`/components/${component.id}`} className="apply-btn">подробнее</Link>
                </div>
            </div>
        </div>
    );
};