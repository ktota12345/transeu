import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    fetchOrders as fetchOrdersApi,
    fetchOrder as fetchOrderApi,
    acceptOrder as acceptOrderApi,
    rejectOrder as rejectOrderApi,
    transferToOperator as transferToOperatorApi,
    transferToAgent as transferToAgentApi,
    sendMessage as sendMessageApi
} from '../../api/ordersApi';

// Async thunks
export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (filters, { rejectWithValue }) => {
        try {
            return await fetchOrdersApi(filters);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchOrder = createAsyncThunk(
    'orders/fetchOrder',
    async (orderId, { rejectWithValue }) => {
        try {
            return await fetchOrderApi(orderId);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const acceptOrder = createAsyncThunk(
    'orders/acceptOrder',
    async ({ orderId, negotiatedTerms }, { rejectWithValue }) => {
        try {
            return await acceptOrderApi(orderId, negotiatedTerms);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const rejectOrder = createAsyncThunk(
    'orders/rejectOrder',
    async ({ orderId, reason }, { rejectWithValue }) => {
        try {
            return await rejectOrderApi(orderId, reason);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const transferToOperator = createAsyncThunk(
    'orders/transferToOperator',
    async ({ conversationId, operatorId }, { rejectWithValue }) => {
        try {
            return await transferToOperatorApi(conversationId, operatorId);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const transferToAgent = createAsyncThunk(
    'orders/transferToAgent',
    async ({ orderId, agentId }, { rejectWithValue }) => {
        try {
            return await transferToAgentApi(orderId, agentId);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const sendMessage = createAsyncThunk(
    'orders/sendMessage',
    async ({ conversationId, content, attachments }, { rejectWithValue }) => {
        try {
            return await sendMessageApi(conversationId, content, attachments);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Initial state
const initialState = {
    orders: [],
    currentOrder: null,
    conversation: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    conversationStatus: 'idle',
    error: null,
    conversationError: null,
    filters: {
        status: 'all',
        dateRange: null,
        search: '',
        sortBy: 'createdAt',
        sortDirection: 'desc',
    },
    pagination: {
        page: 1,
        limit: 10,
        total: 0
    }
};

// Slice
const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.pagination.page = 1; // Reset page when filters change
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
            state.conversation = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchOrders
            .addCase(fetchOrders.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.orders = action.payload.orders;
                state.pagination.total = action.payload.total;
                state.error = null;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            
            // fetchOrder
            .addCase(fetchOrder.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchOrder.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentOrder = action.payload;
                state.conversation = action.payload.conversation;
                state.error = null;
            })
            .addCase(fetchOrder.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            
            // acceptOrder
            .addCase(acceptOrder.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(acceptOrder.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Update the order in the list
                const index = state.orders.findIndex(order => order.id === action.payload.id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
                // Update current order if it's the same
                if (state.currentOrder && state.currentOrder.id === action.payload.id) {
                    state.currentOrder = action.payload;
                }
                state.error = null;
            })
            .addCase(acceptOrder.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            
            // rejectOrder
            .addCase(rejectOrder.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(rejectOrder.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Update the order in the list
                const index = state.orders.findIndex(order => order.id === action.payload.id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
                // Update current order if it's the same
                if (state.currentOrder && state.currentOrder.id === action.payload.id) {
                    state.currentOrder = action.payload;
                }
                state.error = null;
            })
            .addCase(rejectOrder.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            
            // transferToOperator
            .addCase(transferToOperator.pending, (state) => {
                state.conversationStatus = 'loading';
            })
            .addCase(transferToOperator.fulfilled, (state, action) => {
                state.conversationStatus = 'succeeded';
                if (state.currentOrder) {
                    state.currentOrder.status = 'operator_assigned';
                }
                state.conversationError = null;
            })
            .addCase(transferToOperator.rejected, (state, action) => {
                state.conversationStatus = 'failed';
                state.conversationError = action.payload;
            })
            
            // transferToAgent
            .addCase(transferToAgent.pending, (state) => {
                state.conversationStatus = 'loading';
            })
            .addCase(transferToAgent.fulfilled, (state, action) => {
                state.conversationStatus = 'succeeded';
                if (state.currentOrder) {
                    state.currentOrder.status = 'agent_assigned';
                }
                state.conversationError = null;
            })
            .addCase(transferToAgent.rejected, (state, action) => {
                state.conversationStatus = 'failed';
                state.conversationError = action.payload;
            })
            
            // sendMessage
            .addCase(sendMessage.pending, (state) => {
                state.conversationStatus = 'loading';
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.conversationStatus = 'succeeded';
                if (state.conversation) {
                    state.conversation.messages = [...state.conversation.messages, action.payload];
                }
                state.conversationError = null;
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.conversationStatus = 'failed';
                state.conversationError = action.payload;
            });
    }
});

// Selectors
export const selectOrders = (state) => state.orders.orders;
export const selectOrdersStatus = (state) => state.orders.status;
export const selectOrdersError = (state) => state.orders.error;
export const selectFilters = (state) => state.orders.filters;
export const selectPagination = (state) => state.orders.pagination;
export const selectCurrentOrder = (state) => state.orders.currentOrder;

// Dodatkowe selektory
export const selectOrderById = (state, orderId) => {
  // Konwertuj orderId na liczbę, ponieważ w URL jest to string
  const orderIdNum = parseInt(orderId);
  
  // Najpierw sprawdź, czy order jest w currentOrder
  if (state.orders.currentOrder && state.orders.currentOrder.id === orderIdNum) {
    return state.orders.currentOrder;
  }
  
  // Jeśli nie, sprawdź w liście orders
  return state.orders.orders.find(order => order.id === orderIdNum);
};

export const selectOrderStatus = (state) => state.orders.status;
export const selectOrderError = (state) => state.orders.error;
export const selectConversationStatus = (state) => state.orders.conversationStatus;
export const selectConversationError = (state) => state.orders.conversationError;

// Actions
export const { setFilters, setPagination, clearCurrentOrder } = ordersSlice.actions;

export default ordersSlice.reducer;
