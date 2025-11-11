// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './slices/filterSlice';

export const store = configureStore({
    reducer: {
        filter: filterReducer,
    },
});

// Определяем типы для всего нашего состояния и для диспетчера
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;