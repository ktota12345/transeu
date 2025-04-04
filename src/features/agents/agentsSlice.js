import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAgents as fetchAgentsApi, fetchAgent as fetchAgentApi, createAgent as createAgentApi, updateAgent as updateAgentApi, deleteAgent as deleteAgentApi, checkIfAgentExists } from '../../api/agentApi';

const initialState = {
    agents: [],
    currentAgent: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
};

export const fetchAgents = createAsyncThunk(
    'agents/fetchAgents',
    async () => {
        return await fetchAgentsApi();
    }
);

export const fetchAgent = createAsyncThunk(
    'agents/fetchAgent',
    async (id) => {
        return await fetchAgentApi(id);
    }
);

export const createAgent = createAsyncThunk(
    'agents/createAgent',
    async (agentData) => {
        return await createAgentApi(agentData);
    }
);

export const updateAgent = createAsyncThunk(
    'agents/updateAgent',
    async ({ id, agentData }) => {
        return await updateAgentApi(id, agentData);
    }
);

export const deleteAgent = createAsyncThunk(
    'agents/deleteAgent',
    async (id) => {
        return await deleteAgentApi(id);
    }
);

export const cleanupNonExistentAgents = createAsyncThunk(
    'agents/cleanupNonExistentAgents',
    async (_, { getState, dispatch }) => {
        const { agents } = getState().agents;
        const nonExistentAgentIds = [];

        // Sprawdź każdego agenta, czy istnieje w bazie
        for (const agent of agents) {
            try {
                const { exists } = await checkIfAgentExists(agent.id);
                if (!exists) {
                    nonExistentAgentIds.push(agent.id);
                }
            } catch (error) {
                console.error(`Error checking if agent ${agent.id} exists:`, error);
            }
        }

        // Usuń agentów, których nie ma w bazie
        return nonExistentAgentIds;
    }
);

const agentsSlice = createSlice({
    name: 'agents',
    initialState,
    reducers: {
        clearCurrentAgent: (state) => {
            state.currentAgent = null;
        },
        removeAgentLocally: (state, action) => {
            state.agents = state.agents.filter(agent => agent.id !== action.payload);
            if (state.currentAgent && state.currentAgent.id === action.payload) {
                state.currentAgent = null;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all agents
            .addCase(fetchAgents.pending, (state) => {
                state.status = 'loading';
                console.log('Fetching agents...');
            })
            .addCase(fetchAgents.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.agents = action.payload;
                console.log('Agents fetched successfully:', action.payload);
            })
            .addCase(fetchAgents.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
                console.error('Failed to fetch agents:', action.error.message);
            })
            
            // Fetch single agent
            .addCase(fetchAgent.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAgent.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentAgent = action.payload;
            })
            .addCase(fetchAgent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            
            // Create agent
            .addCase(createAgent.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createAgent.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.agents.push(action.payload);
            })
            .addCase(createAgent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            
            // Update agent
            .addCase(updateAgent.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateAgent.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.agents.findIndex(agent => agent.id === action.payload.id);
                if (index !== -1) {
                    state.agents[index] = action.payload;
                }
                state.currentAgent = action.payload;
            })
            .addCase(updateAgent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            
            // Delete agent
            .addCase(deleteAgent.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteAgent.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.agents = state.agents.filter(agent => agent.id !== action.payload.id);
                if (state.currentAgent && state.currentAgent.id === action.payload.id) {
                    state.currentAgent = null;
                }
            })
            .addCase(deleteAgent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            
            // Cleanup non-existent agents
            .addCase(cleanupNonExistentAgents.fulfilled, (state, action) => {
                state.agents = state.agents.filter(agent => !action.payload.includes(agent.id));
            });
    }
});

export const { clearCurrentAgent, removeAgentLocally } = agentsSlice.actions;

export default agentsSlice.reducer;
