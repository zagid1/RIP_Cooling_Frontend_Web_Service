import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import { logoutUser } from './userSlice'; 
import type { DsCoolingDTO, DsCoolingUpdateRequest, DsComponentToCoolingUpdateRequest } from '../../api/Api';

// --- ИЗМЕНЕНИЕ 1: Расширенный стейт ---
interface CoolingState {
    list: DsCoolingDTO[];           
    currentCooling: DsCoolingDTO | null; 
    
    // Новые поля
    total: number;              
    requestTime: string | null; 
    userStats: any[]; // Если есть DTO DsUserStatDTO, лучше использовать его

    loading: boolean;
    error: string | null;
    operationSuccess: boolean;  
}

const initialState: CoolingState = {
    list: [],
    currentCooling: null,
    total: 0,
    requestTime: null,
    userStats: [],
    loading: false,
    error: null,
    operationSuccess: false,
};

// --- 1. Получение списка заявок (с фильтрами и пагинацией) ---
export const fetchCoolingList = createAsyncThunk(
    'cooling/fetchList',
    async (params: { 
        status?: string; 
        from?: string; 
        to?: string; 
        page?: number;
        page_size?: number;
        useIndex?: boolean;
        creator_id?: number | 'all'; // <-- НОВЫЙ ПАРАМЕТР
    }, { rejectWithValue }) => {
        
        const startTime = performance.now();
        
        try {
            const queryArgs: any = {};
            
            if (params.status && params.status !== 'all') queryArgs.status = parseInt(params.status);
            if (params.from) queryArgs.from = params.from;
            if (params.to) queryArgs.to = params.to;
            
            if (params.page) queryArgs.page = params.page;
            if (params.page_size) queryArgs.page_size = params.page_size;
            if (params.useIndex !== undefined) queryArgs.use_index = params.useIndex;

            // --- НОВОЕ: Передаем ID создателя ---
            if (params.creator_id && params.creator_id !== 'all') {
                queryArgs.creator_id = params.creator_id;
            }

            const response = await api.cooling.coolingList(queryArgs);
            
            const endTime = performance.now();
            const duration = (endTime - startTime).toFixed(2) + ' ms';

            return {
                items: response.data.items || [], 
                total: response.data.total || 0,
                serverTime: response.data.query_duration_ms,
                userStats: response.data.user_stats || [],
                clientTime: duration
            };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.description || 'Ошибка загрузки');
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
                components: mappedComponents,
                // Добавляем поля, если они приходят с бэка
                creator_id: data.CreatorID ?? data.creator_id, 
                creation_date: data.CreationDate ?? data.creation_date,
                forming_date: data.FormingDate ?? data.forming_date,
                completion_date: data.CompletionDate ?? data.completion_date,
            };
            
            return mappedCooling;
        } catch (err: any) {
            return rejectWithValue('Заявка не найдена');
        }
    }
);
// --- 3. Сохранение (Обновление полей) ---
export const updateCoolingFields = createAsyncThunk(
    'cooling/updateFields',
    async ({ id, data }: { id: number; data: DsCoolingUpdateRequest }, { rejectWithValue }) => {
        try {
            const payload = {
                room_height: data.room_height,
                room_area: data.room_area
            };            
            // @ts-ignore
            await api.cooling.coolingUpdate(id, payload);
            return data;
        } catch (err: any) {
            return rejectWithValue('Ошибка сохранения');
        }
    }
);

// --- 4. Обновление компонента ---
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

// --- 5. Удаление компонента ---
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

// --- 6. Сформировать заявку ---
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

// --- 8. Резолв заявки ---
export const resolveCooling = createAsyncThunk(
    'cooling/resolve',
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
            // --- СПИСОК ---
            .addCase(fetchCoolingList.pending, (state) => { 
                // Показываем лоадер только если список пуст (первая загрузка)
                if (state.list.length === 0) {
                    state.loading = true; 
                } 
            })
            .addCase(fetchCoolingList.fulfilled, (state, action) => {
                state.loading = false;
                
                // --- ВАЖНО: Обновляем стейт новыми данными ---
                state.list = action.payload.items || []; 
                state.total = action.payload.total || 0;
                
                if (action.payload.userStats) {
                    state.userStats = action.payload.userStats;
                }

                // Формируем красивую строку времени
                const dbTime = action.payload.serverTime 
                    ? `DB: ${action.payload.serverTime.toFixed(2)}ms` 
                    : '';
                state.requestTime = dbTime 
                    ? `${dbTime} | Total: ${action.payload.clientTime}` 
                    : action.payload.clientTime;
            })
            .addCase(fetchCoolingList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // --- ДЕТАЛИ ---
            .addCase(fetchCoolingById.pending, (state) => { 
                state.loading = true; 
            })
            .addCase(fetchCoolingById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCooling = action.payload;
            })

            // --- ДЕЙСТВИЯ (Остальные редьюсеры) ---
            // (Они были правильные, я их просто копирую логически)
            .addCase(submitCooling.fulfilled, (state) => { state.operationSuccess = true; })
            .addCase(deleteCooling.fulfilled, (state) => { state.operationSuccess = true; })
            .addCase(resolveCooling.fulfilled, (state, action) => {
                state.operationSuccess = true;
                if (state.currentCooling && state.currentCooling.id === action.payload.id) {
                    state.currentCooling.status = action.payload.action === 'complete' ? 4 : 5;
                }
            })
            .addCase(logoutUser.fulfilled, () => initialState);
    }
});

export const { resetOperationSuccess, clearCurrentCooling } = coolingSlice.actions;
export default coolingSlice.reducer;