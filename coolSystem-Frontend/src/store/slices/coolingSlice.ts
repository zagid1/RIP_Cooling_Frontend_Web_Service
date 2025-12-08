import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import { logoutUser } from './userSlice'; 
import type { DsCoolingDTO, DsCoolingUpdateRequest, DsComponentToCoolingUpdateRequest } from '../../api/Api';



interface CoolingState {
    list: DsCoolingDTO[];           
    currentOrder: DsCoolingDTO | null; 
    loading: boolean;
    error: string | null;
    operationSuccess: boolean;  
}

const initialState: CoolingState = {
    list: [],
    currentOrder: null,
    loading: false,
    error: null,
    operationSuccess: false,
};

// --- 1. Получение списка заявок (с фильтрами) ---
export const fetchOrdersList = createAsyncThunk(
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
export const fetchOrderById = createAsyncThunk(
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

            const mappedOrder: DsCoolingDTO = {
                id: data.ID ?? data.id,
                status: data.Status ?? data.status ?? 1, 
                room_area: data.room_area ?? 0,
                room_height: data.room_height ?? 0,
                cooling_power: data.cooling_power ?? 0,
                components: mappedComponents
            };
            
            console.log('Загруженная заявка (после маппинга):', mappedOrder); 
            return mappedOrder;
        } catch (err: any) {
            return rejectWithValue('Заявка не найдена');
        }
    }
);

// --- 3. Сохранение (Обновление полей: вес, рост и т.д.) ---
export const updateOrderFields = createAsyncThunk(
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
    async ({ orderId, componentId, count }: { orderId: number; componentId: number; count: number }, { rejectWithValue }) => {
        try {
            const data: DsComponentToCoolingUpdateRequest = { count: count };
            await api.cooling.componentsUpdate(orderId, componentId, data);
            return { componentId, count };
        } catch (err) {
            return rejectWithValue('Не удалось обновить количество');
        }
    }
);

// --- 5. Удаление фактора из заявки ---
export const removeComponentFromOrder = createAsyncThunk(
    'cooling/removeComponent',
    async ({ orderId, componentId }: { orderId: number; componentId: number }, { rejectWithValue }) => {
        try {
            await api.cooling.componentsDelete(orderId, componentId);
            return componentId;
        } catch (err) {
            return rejectWithValue('Ошибка удаления компонента');
        }
    }
);

// --- 6. Сформировать заявку (Отправить) ---
export const submitOrder = createAsyncThunk(
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
export const deleteOrder = createAsyncThunk(
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

const coolingSlice = createSlice({
    name: 'cooling',
    initialState,
    reducers: {
        resetOperationSuccess: (state) => {
            state.operationSuccess = false;
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Список
            .addCase(fetchOrdersList.pending, (state) => { state.loading = true; })
            .addCase(fetchOrdersList.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload || []; 
})
            // Детали
            .addCase(fetchOrderById.pending, (state) => { state.loading = true; state.currentOrder = null; })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            // Обновление полей (локально обновляем стейт)
            .addCase(updateOrderFields.fulfilled, (state, action) => {
                if (state.currentOrder) {
                    state.currentOrder = { ...state.currentOrder, ...action.payload };
                }
            })
            // Обновление количества компонента в заявке
            .addCase(updateComponentCount.fulfilled, (state, action) => {
                if (state.currentOrder && state.currentOrder.components) {
                    const cooling = state.currentOrder.components.find(f => f.component_id === action.payload.componentId);
                    if (cooling) cooling.count = action.payload.count;
                }
            })
            // Удаление компонента
            .addCase(removeComponentFromOrder.fulfilled, (state, action) => {
                if (state.currentOrder && state.currentOrder.components) {
                    state.currentOrder.components = state.currentOrder.components.filter(f => f.component_id !== action.payload);
                }
            })
            // Сформировать / Удалить (успех)
            .addCase(submitOrder.fulfilled, (state) => { state.operationSuccess = true; })
            .addCase(deleteOrder.fulfilled, (state) => { state.operationSuccess = true; })
            // Сброс
            .addCase(logoutUser.fulfilled, () => initialState);
    }
});

export const { resetOperationSuccess, clearCurrentOrder } = coolingSlice.actions;
export default coolingSlice.reducer;