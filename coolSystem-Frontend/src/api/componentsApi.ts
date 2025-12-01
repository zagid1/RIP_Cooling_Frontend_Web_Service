import type { IPaginatedComponents, IComponent, ICartBadge } from '../types';
import { COMPONENTS_MOCK } from './mock';
//import { getApiBase } from '../config';

//const API_BASE = '/api';

// const isTauri = import.meta.env.VITE_TARGET === 'tauri';
// const BACKEND_IP = 'https://10.241.187.182:8080/'; 
// const API_BASE_URL = isTauri ? `${BACKEND_IP}/api` : '/api';

//const API_BASE = getApiBase();
const isTauri = import.meta.env.VITE_TARGET === 'tauri';
const BACKEND_IP = 'http://10.225.38.51:8080/';
const API_BASE = isTauri ? `${BACKEND_IP}/api` : '/api';

// Получение списка факторов с фильтраией по названию
export const getComponents = async (title: string): Promise<IPaginatedComponents> => {
    const url = title 
        ? `${API_BASE}/components?title=${encodeURIComponent(title)}`
        : `${API_BASE}/components`;

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
        const response = await fetch(`${API_BASE}/components/${id}`);
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

// Получение корзины
export const getCartBadge = async (): Promise<ICartBadge> => {
    try {
        const token = localStorage.getItem('authToken'); 
        if (!token) {
            throw new Error('No auth token found');
        }

        const response = await fetch(`${API_BASE}/cooling/coolcart`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cart data');
        }
        return await response.json();

    } catch (error) {
        console.warn('Could not fetch cart data, assuming cart is empty.', error);
        return { cooling_id: null, count: 0 };
    }
};