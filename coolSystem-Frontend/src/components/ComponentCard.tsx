// ComponentCard.tsx
//import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { IComponent } from '../types';
import { useSelector, useDispatch } from 'react-redux';
import { addComponentToDraft } from '../store/slices/cartSlice';
import type { RootState, AppDispatch } from '../store';
import './styles/ComponentCard.css'

export const DefaultImage = `/mock_images/default.webp`;

interface ComponentCardProps {
    component: IComponent;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({ component }) => {
    const dispatch = useDispatch<AppDispatch>();
    const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

    const handleAdd = () => {
        if (component.id) {
            dispatch(addComponentToDraft(component.id));
        }
    };

    const imageSrc = component.image_url || DefaultImage;

    return (
        <div className="component-card">
            <div className="component-image">
                <img src={imageSrc} alt={component.title} />
            </div>
            <div className="component-info">
                <h3>{component.title}</h3>
                <p className="tdp">TDP: {component.tdp || 'N/A'} Вт</p>
                <div className="buttons-container">
                    {isAuthenticated && (
                        <button 
                            className='apply-btn' 
                            onClick={handleAdd}
                        >
                            Добавить
                        </button>
                    )}
                    {/* <form action={`/cooling/draft/components/${component.id}`} method="POST" className="button-form"> */}
                        {/* <button className="apply-btn" type="submit">добавить</button> */}
                    {/* </form> */}
                    <Link to={`/components/${component.id}`} className="apply-btn">подробнее</Link>
                </div>
            </div>
        </div>
    );
};