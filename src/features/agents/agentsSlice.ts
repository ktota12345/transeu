import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Agent } from '../../types/agent';

interface AgentsState {
    agents: Agent[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: AgentsState = {
    agents: [],
    status: 'idle',
    error: null
};

export const fetchAgents = createAsyncThunk(
    'agents/fetchAgents',
    async () => {
        // TODO: Implementacja pobierania agentów z API
        return [] as Agent[];
    }
);

const agentsSlice = createSlice({
    name: 'agents',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAgents.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAgents.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.agents = action.payload;
            })
            .addCase(fetchAgents.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || null;
            });
    }
});

export default agentsSlice.reducer;
