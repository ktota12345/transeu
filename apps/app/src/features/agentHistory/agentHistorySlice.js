import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchAgentHistory as fetchAgentHistoryApi, 
  fetchAgentHistoryEntry as fetchAgentHistoryEntryApi,
  clearAgentHistory as clearAgentHistoryApi
} from '../../api/agentHistoryApi';

const initialState = {
  history: [],
  currentHistoryEntry: null,
  status: 'idle',
  error: null
};

export const fetchAgentHistory = createAsyncThunk(
  'agentHistory/fetchHistory',
  async (agentId, { rejectWithValue }) => {
    try {
      console.log(`agentHistorySlice: Pobieranie historii dla agenta ${agentId}`);
      const data = await fetchAgentHistoryApi(agentId);
      console.log(`agentHistorySlice: Otrzymano dane:`, data);
      
      // Upewnij się, że dane są tablicą
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object') {
        // Jeśli to obiekt, ale nie tablica, spróbuj pobrać dane dla konkretnego agenta
        const agentData = data[agentId] || [];
        return agentData;
      } else {
        // W przypadku braku danych, zwróć pustą tablicę
        console.log(`agentHistorySlice: Brak danych dla agenta ${agentId}`);
        return [];
      }
    } catch (error) {
      console.error('agentHistorySlice: Błąd podczas pobierania historii:', error);
      return rejectWithValue(error.message || 'Nie udało się pobrać historii agenta');
    }
  }
);

export const fetchAgentHistoryEntry = createAsyncThunk(
  'agentHistory/fetchHistoryEntry',
  async (entryId) => {
    return await fetchAgentHistoryEntryApi(entryId);
  }
);

export const clearAgentHistory = createAsyncThunk(
  'agentHistory/clearHistory',
  async (agentId) => {
    return await clearAgentHistoryApi(agentId);
  }
);

const agentHistorySlice = createSlice({
  name: 'agentHistory',
  initialState,
  reducers: {
    clearCurrentHistoryEntry: (state) => {
      state.currentHistoryEntry = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch agent history
      .addCase(fetchAgentHistory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAgentHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.history = action.payload || [];
        state.error = null;
        console.log('agentHistorySlice: Historia załadowana pomyślnie:', state.history);
      })
      .addCase(fetchAgentHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Nie udało się pobrać historii agenta';
        console.error('agentHistorySlice: Błąd podczas ładowania historii:', state.error);
      })
      
      // Fetch agent history entry
      .addCase(fetchAgentHistoryEntry.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAgentHistoryEntry.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentHistoryEntry = action.payload;
      })
      .addCase(fetchAgentHistoryEntry.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      
      // Clear agent history
      .addCase(clearAgentHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(clearAgentHistory.fulfilled, (state) => {
        state.status = 'succeeded';
        state.history = [];
      })
      .addCase(clearAgentHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { clearCurrentHistoryEntry } = agentHistorySlice.actions;

// Selektory
export const selectAgentHistory = (state) => state.agentHistory.history;
export const selectAgentHistoryStatus = (state) => state.agentHistory.status;
export const selectAgentHistoryError = (state) => state.agentHistory.error;
export const selectCurrentHistoryEntry = (state) => state.agentHistory.currentHistoryEntry;

export default agentHistorySlice.reducer;
