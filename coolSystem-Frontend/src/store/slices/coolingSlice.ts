import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import { logoutUser } from './userSlice'; 
import type { DsCoolingDTO, DsCoolingUpdateRequest, DsComponentToCoolingUpdateRequest } from '../../api/Api';



interface CoolingState {
    list: DsCoolingDTO[];           
    currentCooling: DsCoolingDTO | null; 
    loading: boolean;
    error: string | null;
    operationSuccess: boolean;  
}

const initialState: CoolingState = {
    list: [],
    currentCooling: null,
    loading: false,
    error: null,
    operationSuccess: false,
};

// --- 1. Получение списка заявок (с фильтрами) ---
export const fetchCoolingList = createAsyncThunk(
    'cooling/fetchList',
    async (filters: { status?: string; from?: string; to?: string }, { rejectWithValue }) => {
        try {
            const queryArgs: any = {};
            if (filters.status && filters.status !== 'all') queryArgs.status = parseInt(filters.status);
            if (filters.from) queryArgs.from = filters.from;
            if (filters.to) queryArgs.to = filters.to;
            const response = await api.cooling.coolingList(queryArgs);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.description || 'Ошибка загрузки списка');
        }
    }
);

// --- 2. Получение одной заявки по ID ---
export const fetchCoolingById = createAsyncThunk(
    'cooling/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await api.cooling.coolingDetail(parseInt(id));
            const data: any = response.data;
            
            // Посмотрим, что реально приходит до маппинга (для отладки)
            console.log('Сырые данные от API:', data);

            const mappedComponents = (data.Components || data.components || []).map((f: any) => ({
                component_id: f.ComponentID ?? f.component_id ?? 0,
                title: f.Title ?? f.title ?? 'Без названия',
                image_url: f.Image_url ?? f.image_url ?? '',
                description: f.Description ?? f.description ?? '',
                count: f.Count ?? f.count  ?? 1 
            }));

            const mappedCooling: DsCoolingDTO = {
                id: data.ID ?? data.id,
                status: data.Status ?? data.status ?? 1, 
                room_area: data.room_area ?? 0,
                room_height: data.room_height ?? 0,
                cooling_power: data.cooling_power ?? 0,
                components: mappedComponents
            };
            
            console.log('Загруженная заявка (после маппинга):', mappedCooling); 
            return mappedCooling;
        } catch (err: any) {
            return rejectWithValue('Заявка не найдена');
        }
    }
);

// --- 3. Сохранение (Обновление полей: вес, рост и т.д.) ---
export const updateCoolingFields = createAsyncThunk(
    'cooling/updateFields',
    async ({ id, data }: { id: number; data: DsCoolingUpdateRequest }, { rejectWithValue }) => {
        try {
            const payload = {
                Room_Height: data.room_height,
                Room_Area: data.room_area
            };            
            // @ts-ignore
            await api.cooling.coolingUpdate(id, payload);
            return data;
        } catch (err: any) {
            return rejectWithValue('Ошибка сохранения');
        }
    }
);

// --- 4. Обновление описания фактора (М-М связь) ---
export const updateComponentCount = createAsyncThunk(
    'cooling/updateComponentNum',
    async ({ coolingId, componentId, count }: { coolingId: number; componentId: number; count: number }, { rejectWithValue }) => {
        try {
            const data: DsComponentToCoolingUpdateRequest = { count: count };
            await api.cooling.componentsUpdate(coolingId, componentId, data);
            return { componentId, count };
        } catch (err) {
            return rejectWithValue('Не удалось обновить количество');
        }
    }
);

// --- 5. Удаление фактора из заявки ---
export const removeComponentFromCooling = createAsyncThunk(
    'cooling/removeComponent',
    async ({ coolingId, componentId }: { coolingId: number; componentId: number }, { rejectWithValue }) => {
        try {
            await api.cooling.componentsDelete(coolingId, componentId);
            return componentId;
        } catch (err) {
            return rejectWithValue('Ошибка удаления компонента');
        }
    }
);

// --- 6. Сформировать заявку (Отправить) ---
export const submitCooling = createAsyncThunk(
    'cooling/submit',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.cooling.formUpdate(id);
            return id;
        } catch (err: any) {
            return rejectWithValue('Ошибка формирования заявки');
        }
    }
);

// --- 7. Удалить заявку ---
export const deleteCooling = createAsyncThunk(
    'cooling/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.cooling.coolingDelete(id);
            return id;
        } catch (err) {
            return rejectWithValue('Ошибка удаления');
        }
    }
);

// --- 8. НОВОЕ: Резолв заявки (Принять/Отклонить) ---
export const resolveCooling = createAsyncThunk(
    'frax/resolve',
    async ({ id, action }: { id: number; action: 'complete' | 'reject' }, { rejectWithValue }) => {
        try {
            await api.cooling.resolveUpdate(id, { action });
            return { id, action };
        } catch (err: any) {
            return rejectWithValue('Не удалось обновить статус заявки');
        }
    }
);


const coolingSlice = createSlice({
    name: 'cooling',
    initialState,
    reducers: {
        resetOperationSuccess: (state) => {
            state.operationSuccess = false;
        },
        clearCurrentCooling: (state) => {
            state.currentCooling = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Список
            .addCase(fetchCoolingList.pending, (state) => { 
                if (state.list.length === 0) {
                    state.loading = true; 
                } 
            })
            .addCase(fetchCoolingList.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload || []; 
})
            // Детали
            .addCase(fetchCoolingById.pending, (state) => { state.loading = true; /*state.currentCooling = null; */})
            .addCase(fetchCoolingById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCooling = action.payload;
            })
            // Обновление полей (локально обновляем стейт)
            .addCase(updateCoolingFields.fulfilled, (state, action) => {
                if (state.currentCooling) {
                    state.currentCooling = { ...state.currentCooling, ...action.payload };
                }
            })
            // Обновление количества компонента в заявке
            .addCase(updateComponentCount.fulfilled, (state, action) => {
                if (state.currentCooling && state.currentCooling.components) {
                    const cooling = state.currentCooling.components.find(f => f.component_id === action.payload.componentId);
                    if (cooling) cooling.count = action.payload.count;
                }
            })
            // Удаление компонента
            .addCase(removeComponentFromCooling.fulfilled, (state, action) => {
                if (state.currentCooling && state.currentCooling.components) {
                    state.currentCooling.components = state.currentCooling.components.filter(f => f.component_id !== action.payload);
                }
            })
            // Сформировать / Удалить (успех)
            .addCase(submitCooling.fulfilled, (state) => { state.operationSuccess = true; })
            .addCase(deleteCooling.fulfilled, (state) => { state.operationSuccess = true; })
            // Сброс
            // --- Обработка решения модератора ---
            .addCase(resolveCooling.fulfilled, (state, action) => {
                state.operationSuccess = true;
                // Оптимистичное обновление статуса в текущем просмотре
                if (state.currentCooling && state.currentCooling.id === action.payload.id) {
                    // 4 = Completed, 5 = Rejected
                    state.currentCooling.status = action.payload.action === 'complete' ? 4 : 5;
                }
            })
            .addCase(logoutUser.fulfilled, () => initialState);
    }
});

export const { resetOperationSuccess, clearCurrentCooling } = coolingSlice.actions;
export default coolingSlice.reducer;