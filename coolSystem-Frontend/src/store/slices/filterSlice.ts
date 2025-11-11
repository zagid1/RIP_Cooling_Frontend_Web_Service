// src/store/slices/filterSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

interface FilterState {
    searchTerm: string;
}

const initialState: FilterState = {
    searchTerm: '',
};

export const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload;
        },
    },
});

// Экспортируем action для использования в компонентах
export const { setSearchTerm } = filterSlice.actions;

// Создаем селектор для удобного получения данных из состояния
export const selectSearchTerm = (state: RootState) => state.filter.searchTerm;

// Экспортируем редьюсер
export default filterSlice.reducer;