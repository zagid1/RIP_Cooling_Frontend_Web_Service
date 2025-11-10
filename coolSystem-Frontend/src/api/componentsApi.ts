import type { IPaginatedComponents, IComponent } from '../types';
import { COMPONENTS_MOCK } from './mock';

const API_PREFIX = '/api';

// Получение списка факторов с фильтраией по названию
export const getComponents = async (title: string): Promise<IPaginatedComponents> => {
    const url = title 
        ? `${API_PREFIX}/components?title=${encodeURIComponent(title)}`
        : `${API_PREFIX}/components`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Backend is not available');
        }
    const data = await response.json();
    return {
        items: data.items || [],
        total: data.total || 0
    };
    } catch (error) {
        console.warn('Failed to fetch from backend, using mock data.', error);
        const filteredMockItems = COMPONENTS_MOCK.items.filter(component =>
            component.title.toLowerCase().includes(title.toLowerCase())
        );
        return { items: filteredMockItems, total: filteredMockItems.length };
    }
};

// Получение одного фактора по ID
export const getComponentById = async (id: string): Promise<IComponent | null> => {
    try {
        const response = await fetch(`${API_PREFIX}/components/${id}`);
        if (!response.ok) {
            throw new Error('Backend is not available');
        }
        return await response.json();
    } catch (error) {
        console.warn(`Failed to fetch component ${id}, using mock data.`, error);
        const factor = COMPONENTS_MOCK.items.find(f => f.id === parseInt(id));
        return factor || null;
    }
};