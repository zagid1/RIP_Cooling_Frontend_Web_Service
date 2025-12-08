import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import { logoutUser } from './userSlice';
import type { RootState } from '../index'; // Убедитесь, что импорт есть

interface CartState {
    cooling_id: number | null;
    count: number;
    loading: boolean;
    error: string | null;
}

const initialState: CartState = {
    cooling_id: null,
    count: 0,
    loading: false,
    error: null,
};


// Получение бейджика
export const fetchCartBadge = createAsyncThunk<
    any,
    void,
    { state: RootState }
>(
    'cart/fetchCartBadge',
    async (_, { getState, rejectWithValue }) => {
        const state = getState();
        
        // Если пользователь не авторизован, не делаем запрос
        if (!state.user.isAuthenticated) {
            return rejectWithValue('User is not authenticated');
        }

        try {
            const response = await api.cooling.coolcartList();
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch cart');
        }
    }
);

// Добавление компонента в черновик
export const addComponentToDraft = createAsyncThunk<
    number,
    number,
    { state: RootState } // Типизация нужна, чтобы dispatch понимал fetchCartBadge
>(
    'cart/addToDraft',
    async (factorId, { dispatch, rejectWithValue }) => {
        try {
            await api.cooling.draftComponentsCreate(factorId);
            // Обновляем бейджик корзины
            dispatch(fetchCartBadge());
            return factorId;
        } catch (error: any) {
            const errorMessage = error.response?.data?.description || "Неизвестная ошибка";

            // Игнорируем ошибку дубликата (просто не показываем алерт)
            if (errorMessage.includes("уже добавлен") || errorMessage.includes("already")) {
                console.log("Компонент уже в корзине");
                return factorId;
            }

            alert("Ошибка при добавлении: " + errorMessage);
            return rejectWithValue('Failed to add');
        }
    }
);

// Слайс
const cartSlice = createSlice({
    name: 'cart',
    initialState, 
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCartBadge.fulfilled, (state, action) => {
                state.cooling_id = action.payload.cooling_id || null;
                state.count = action.payload.count || 0;
            })
            .addCase(fetchCartBadge.rejected, (state) => {
                state.cooling_id = null;
                state.count = 0;
            })
            .addCase(logoutUser.fulfilled, () => initialState);
    }
});

export default cartSlice.reducer;