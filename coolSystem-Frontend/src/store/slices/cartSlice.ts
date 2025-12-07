import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import { logoutUser } from './userSlice';



interface CartState {
    cooling_id: number | null;
    count: number;
    loading: boolean;
    error: string | null
}

const initialState: CartState = {
    cooling_id: null,
    count: 0,
    loading: false,
    error: null,
};

// Получение бейджика
export const fetchCartBadge = createAsyncThunk(
    'cart/fetchCartBadge',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.cooling.coolcartList();
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch cart');
        }
    }
);

// Добавление компонента в черновик 
export const addComponentToDraft = createAsyncThunk(
    'cart/addToDraft',
    async (factorId: number, { dispatch, rejectWithValue }) => {
        try {
            await api.cooling.draftComponentsCreate(factorId);
            dispatch(fetchCartBadge());
            return factorId;
        } catch (error: any) {
            alert("Ошибка при добавлении: " + (error.response?.data?.description || "Неизвестная ошибка"));
            return rejectWithValue('Failed to add');
        }
    }
);

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