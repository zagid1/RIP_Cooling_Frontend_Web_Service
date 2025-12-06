import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import { COMPONENTS_MOCK} from '../../api/mock'; 
import type { IComponent } from '../../types';



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

// --- Thunk: Получение списка факторов ---
export const fetchComponents = createAsyncThunk(
    'components/fetchComponents',
    async (title: string, { rejectWithValue }) => {
        try {
            const response = await api.components.componentsList({ title });
            
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

// --- Thunk: Получение одного фактора ---
export const fetchComponentById = createAsyncThunk(
    'components/fetchComponentById',
    async (id: string, { rejectWithValue }) => {
        try {
            const componentId = parseInt(id);
            const response = await api.components.componentsDetail(componentId);
            
            const data = response.data;
            const mappedComponent: IComponent = {
                id: data.id ?? 0,
                title: data.title ?? 'Без названия',
                description: data.description ?? '',
                tdp: data.tdp ?? 0,
                image_url: data.image_url ?? '',
                status: data.status ?? false,
            };

            return mappedComponent;
        } catch (err) {
            return rejectWithValue(id);
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
                console.warn('[Redux] Ошибка загрузки списка. Используем моки.');
                const filterTitle = (action.meta.arg as string) || '';
                const filteredMockItems = COMPONENTS_MOCK.items.filter(component =>
                    component.title.toLowerCase().includes(filterTitle.toLowerCase())
                );
                state.items = filteredMockItems;
                state.total = filteredMockItems.length;
            })
            .addCase(fetchComponentById.pending, (state) => {
                state.loading = true;
                state.currentComponent = null; 
            })
            .addCase(fetchComponentById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentComponent = action.payload;
            })
            .addCase(fetchComponentById.rejected, (state, action) => {
                state.loading = false;
                
                const idStr = action.meta.arg;
                const id = parseInt(idStr);
                console.log(`[Redux] Ошибка загрузки фактора ID: ${id}. Ищем в моках...`);

                const component = COMPONENTS_MOCK.items.find(f => f.id === id);
                state.currentComponent = component || null;
            });
    },
});

export const { clearCurrentComponent } = componentsSlice.actions;
export default componentsSlice.reducer;