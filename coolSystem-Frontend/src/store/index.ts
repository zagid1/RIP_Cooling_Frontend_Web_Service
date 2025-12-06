import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './slices/filterSlice';
import componentReducer from './slices/componentsSlice'; 
import cartReducer from './slices/cartSlice';     
import userReducer from './slices/userSlice';
import coolingReducer from './slices/coolingSlice';

export const store = configureStore({
    reducer: {
        filter: filterReducer,
        components: componentReducer, 
        cart: cartReducer, 
        user: userReducer,
        cooling: coolingReducer,    
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;