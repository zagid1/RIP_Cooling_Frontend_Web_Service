import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api'; 
import { COMPONENTS_MOCK } from '../../api/mock'; 
import type { IComponent } from '../../types';

// Интерфейсы для аргументов Thunk (чтобы не тянуть типы API напрямую в компоненты)
interface CreateComponentArgs {
    title: string;
    description: string;
    tdp: number;
    image_url?: string;
}

interface UpdateComponentArgs {
    id: number;
    data: {
        title?: string;
        description?: string;
        tdp?: number;
        image_url?: string;
    };
}

interface UploadImageArgs {
    id: number;
    file: File;
}

interface ComponentsState {
    items: IComponent[];
    total: number;
    currentComponent: IComponent | null;
    loading: boolean;
    error: string | null;
}

const initialState: ComponentsState = {
    items: [],
    total: 0,
    currentComponent: null,
    loading: false,
    error: null,
};

// --- Thunk: Получение списка ---
export const fetchComponents = createAsyncThunk(
    'components/fetchComponents',
    async (title: string | undefined, { rejectWithValue }) => {
        try {
            // Передаем объект query, как в определении api.componentsList(query, params)
            const response = await api.components.componentsList({ title: title || undefined });
            
            // Предполагаем, что DsPaginatedResponse содержит items и total
            const rawItems = response.data.items || [];
            
            const mappedItems: IComponent[] = Array.isArray(rawItems) 
                ? rawItems.map((item: any) => ({
                    id: item.id ?? 0,
                    title: item.title ?? 'Без названия',
                    description: item.description ?? '',
                    tdp: item.tdp ?? 0,
                    image_url: item.image_url ?? '',
                    status: item.status ?? false,
                }))
                : [];

            return {
                items: mappedItems,
                total: response.data.total || 0
            };
        } catch (err) {
            return rejectWithValue('Backend unavailable');
        }
    }
);

// --- Thunk: Получение одного ---
export const fetchComponentById = createAsyncThunk(
    'components/fetchComponentById',
    async (id: string, { rejectWithValue }) => {
        try {
            const componentId = parseInt(id);
            const response = await api.components.componentsDetail(componentId);
            return response.data as IComponent;
        } catch (err) {
            return rejectWithValue(id);
        }
    }
);

// --- Thunk: Создание ---
export const createComponent = createAsyncThunk(
    'components/createComponent',
    async (data: CreateComponentArgs, { rejectWithValue }) => {
        try {
            // Используем componentsCreate
            const response = await api.components.componentsCreate(data);
            return response.data; // Возвращает DsComponentDTO
        } catch (err) {
            console.error(err);
            return rejectWithValue('Ошибка при создании');
        }
    }
);

// --- Thunk: Обновление ---
export const updateComponent = createAsyncThunk(
    'components/updateComponent',
    async ({ id, data }: UpdateComponentArgs, { rejectWithValue }) => {
        try {
            // Используем componentsUpdate
            const response = await api.components.componentsUpdate(id, data);
            return response.data;
        } catch (err) {
            console.error(err);
            return rejectWithValue('Ошибка при обновлении');
        }
    }
);

// --- Thunk: Удаление ---
export const deleteComponent = createAsyncThunk(
    'components/deleteComponent',
    async (id: number, { rejectWithValue }) => {
        try {
            // Используем componentsDelete
            await api.components.componentsDelete(id);
            return id;
        } catch (err) {
            console.error(err);
            return rejectWithValue('Ошибка при удалении');
        }
    }
);

// --- Thunk: Загрузка изображения ---
export const uploadComponentImage = createAsyncThunk(
    'components/uploadImage',
    async ({ id, file }: UploadImageArgs, { rejectWithValue }) => {
        try {
            // Используем imageCreate. 
            // Согласно вашему API: imageCreate(id, data: { file: File })
            // Клиент сам преобразует объект в FormData, так как указан ContentType.FormData
            const response = await api.components.imageCreate(id, { file: file });
            
            return response.data; // Возвращает Record<string, string> (обычно url)
        } catch (err) {
            console.error(err);
            return rejectWithValue('Ошибка загрузки изображения');
        }
    }
);

const componentsSlice = createSlice({
    name: 'components',
    initialState,
    reducers: {
        clearCurrentComponent: (state) => {
            state.currentComponent = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // FETCH LIST
            .addCase(fetchComponents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchComponents.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items; 
                state.total = action.payload.total;
            })
            .addCase(fetchComponents.rejected, (state, action) => {
                state.loading = false;
                state.error = 'Backend unavailable';
                
                // MOCK FALLBACK
                console.warn('[Redux] API недоступен, используем моки');
                const filterTitle = (action.meta.arg as string) || '';
                const filteredMockItems = COMPONENTS_MOCK.items.filter(component =>
                    component.title.toLowerCase().includes(filterTitle.toLowerCase())
                );
                state.items = filteredMockItems;
                state.total = filteredMockItems.length;
            })
            
            // DELETE
            .addCase(deleteComponent.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            });
            // Для CREATE и UPDATE мы обычно просто перезапрашиваем список в компоненте,
            // либо можно добавлять логику обновления стейта здесь.
    },
});

export const { clearCurrentComponent } = componentsSlice.actions;
export default componentsSlice.reducer;