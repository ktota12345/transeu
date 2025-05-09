import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import * as logisticsBasesApi from '../../api/logisticsBasesApi';

// Przykładowe dane początkowe
const initialBases = [
  { id: 1, name: 'Baza Warszawa', address: 'ul. Transportowa 10, 02-495 Warszawa', coordinates: { lat: 52.229676, lng: 21.012229 } },
  { id: 2, name: 'Baza Poznań', address: 'ul. Logistyczna 5, 61-001 Poznań', coordinates: { lat: 52.406374, lng: 16.925168 } },
  { id: 3, name: 'Baza Kraków', address: 'ul. Spedycyjna 15, 30-001 Kraków', coordinates: { lat: 50.064650, lng: 19.944980 } }
];

// Akcje asynchroniczne
export const fetchLogisticsBases = createAsyncThunk(
  'logisticsBases/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await logisticsBasesApi.fetchLogisticsBases();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addLogisticsBase = createAsyncThunk(
  'logisticsBases/add',
  async (baseData, { rejectWithValue }) => {
    try {
      return await logisticsBasesApi.addLogisticsBase(baseData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLogisticsBase = createAsyncThunk(
  'logisticsBases/update',
  async (baseData, { rejectWithValue }) => {
    try {
      return await logisticsBasesApi.updateLogisticsBase(baseData.id, baseData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteLogisticsBase = createAsyncThunk(
  'logisticsBases/delete',
  async (baseId, { rejectWithValue }) => {
    try {
      await logisticsBasesApi.deleteLogisticsBase(baseId);
      return baseId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const logisticsBasesSlice = createSlice({
  name: 'logisticsBases',
  initialState: {
    bases: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    lastFetched: null // Dodajemy informację o czasie ostatniego pobrania danych
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Obsługa fetchLogisticsBases
      .addCase(fetchLogisticsBases.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLogisticsBases.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bases = action.payload;
        state.lastFetched = new Date().toISOString();
        console.log('Pobrano bazy logistyczne:', action.payload);
      })
      .addCase(fetchLogisticsBases.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Obsługa addLogisticsBase
      .addCase(addLogisticsBase.fulfilled, (state, action) => {
        // Sprawdź, czy baza o takim ID już istnieje
        const existingIndex = state.bases.findIndex(base => base.id === action.payload.id);
        if (existingIndex !== -1) {
          // Jeśli istnieje, zaktualizuj ją
          state.bases[existingIndex] = action.payload;
        } else {
          // Jeśli nie istnieje, dodaj nową
          state.bases.push(action.payload);
        }
        console.log('Dodano/zaktualizowano bazę logistyczną:', action.payload);
      })
      
      // Obsługa updateLogisticsBase
      .addCase(updateLogisticsBase.fulfilled, (state, action) => {
        const index = state.bases.findIndex(base => base.id === action.payload.id);
        if (index !== -1) {
          state.bases[index] = action.payload;
        }
      })
      
      // Obsługa deleteLogisticsBase
      .addCase(deleteLogisticsBase.fulfilled, (state, action) => {
        state.bases = state.bases.filter(base => base.id !== action.payload);
      });
  }
});

// Selektory
export const selectAllLogisticsBases = state => {
  // Upewnij się, że zwracamy tablicę, nawet jeśli state.logisticsBases.bases jest undefined lub null
  const bases = state.logisticsBases?.bases;
  return Array.isArray(bases) ? bases : [];
};

export const selectLogisticsBaseById = (state, baseId) => {
  const bases = selectAllLogisticsBases(state);
  return bases.find(base => base.id === baseId);
};
export const selectLogisticsBasesStatus = state => state.logisticsBases.status;
export const selectLogisticsBasesError = state => state.logisticsBases.error;

export default logisticsBasesSlice.reducer;
