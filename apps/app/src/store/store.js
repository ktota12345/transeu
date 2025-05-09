import { configureStore } from '@reduxjs/toolkit';
import agentsReducer from '../features/agents/agentsSlice';
import ordersReducer from '../features/orders/ordersSlice';
import companyReducer from '../features/company/companySlice';
import agentHistoryReducer from '../features/agentHistory/agentHistorySlice';
import logisticsBasesReducer from '../features/company/logisticsBasesSlice';

export const store = configureStore({
    reducer: {
        agents: agentsReducer,
        orders: ordersReducer,
        company: companyReducer,
        agentHistory: agentHistoryReducer,
        logisticsBases: logisticsBasesReducer,
    },
});
