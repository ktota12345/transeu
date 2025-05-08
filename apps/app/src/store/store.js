import { configureStore } from '@reduxjs/toolkit';
import agentsReducer from '../features/agents/agentsSlice';
import ordersReducer from '../features/orders/ordersSlice';

export const store = configureStore({
    reducer: {
        agents: agentsReducer,
        orders: ordersReducer,
    },
});
