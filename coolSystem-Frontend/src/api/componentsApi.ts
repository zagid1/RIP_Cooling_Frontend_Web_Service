import type { IPaginatedComponents, IComponent, ICartBadge } from '../types';
import { COMPONENTS_MOCK } from './mock';
//import { getApiBase } from '../config';

// 1. Надежный способ определить, что мы в Tauri (работает всегда)
// @ts-ignore
const isTauri = !!window.__TAURI__;

// 2. Настройка адреса
// Если сервер запущен на ТОМ ЖЕ компьютере, используйте localhost.
// IP 10.167... может измениться завтра, а localhost вечен.
// ВАЖНО: http, а не https (если у вас нет SSL сертификата на локалке)
const BACKEND_URL = 'http://localhost:8080'; 

// Логируем для отладки (увидите в консоли devtools)
console.log('Environment:', isTauri ? 'Tauri App' : 'Browser');
console.log('Backend URL:', BACKEND_URL);

const API_BASE = isTauri 
    ? `${BACKEND_URL}/api` // В приложении: http://localhost:8080/api
    : '/api';              // В браузере (dev): прокси

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