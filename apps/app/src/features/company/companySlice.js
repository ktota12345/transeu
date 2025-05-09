import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchCompanyConfig, 
  updateCompanyConfig,
  fetchLogisticsBases,
  fetchLogisticsBase,
  createLogisticsBase,
  updateLogisticsBase,
  deleteLogisticsBase
} from '../../api/companyApi';

// Async thunks
export const getCompanyConfig = createAsyncThunk(
  'company/getConfig',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCompanyConfig();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveCompanyConfig = createAsyncThunk(
  'company/saveConfig',
  async (configData, { rejectWithValue }) => {
    try {
      return await updateCompanyConfig(configData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getLogisticsBases = createAsyncThunk(
  'company/getLogisticsBases',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchLogisticsBases();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getLogisticsBase = createAsyncThunk(
  'company/getLogisticsBase',
  async (id, { rejectWithValue }) => {
    try {
      return await fetchLogisticsBase(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addLogisticsBase = createAsyncThunk(
  'company/addLogisticsBase',
  async (baseData, { rejectWithValue }) => {
    try {
      return await createLogisticsBase(baseData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const editLogisticsBase = createAsyncThunk(
  'company/editLogisticsBase',
  async ({ id, baseData }, { rejectWithValue }) => {
    try {
      return await updateLogisticsBase(id, baseData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeLogisticsBase = createAsyncThunk(
  'company/removeLogisticsBase',
  async (id, { rejectWithValue }) => {
    try {
      await deleteLogisticsBase(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  config: {
    name: '',
    taxId: '',
    address: {
      street: '',
      postalCode: '',
      city: '',
      country: ''
    },
    contact: {
      email: '',
      phone: '',
      website: ''
    },
    logo: null,
    operationalSettings: {
      defaultCurrency: 'PLN',
      workingHours: {
        start: '08:00',
        end: '16:00'
      },
      timezone: 'Europe/Warsaw'
    }
  },
  logisticsBases: [],
  selectedBase: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

// Slice
const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setSelectedBase: (state, action) => {
      state.selectedBase = action.payload;
    },
    clearSelectedBase: (state) => {
      state.selectedBase = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Company config cases
      .addCase(getCompanyConfig.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getCompanyConfig.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.config = action.payload;
      })
      .addCase(getCompanyConfig.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(saveCompanyConfig.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveCompanyConfig.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.config = action.payload;
      })
      .addCase(saveCompanyConfig.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Logistics bases cases
      .addCase(getLogisticsBases.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getLogisticsBases.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.logisticsBases = action.payload;
      })
      .addCase(getLogisticsBases.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(getLogisticsBase.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getLogisticsBase.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedBase = action.payload;
      })
      .addCase(getLogisticsBase.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addLogisticsBase.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addLogisticsBase.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.logisticsBases.push(action.payload);
      })
      .addCase(addLogisticsBase.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(editLogisticsBase.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(editLogisticsBase.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.logisticsBases.findIndex(base => base.id === action.payload.id);
        if (index !== -1) {
          state.logisticsBases[index] = action.payload;
        }
        if (state.selectedBase && state.selectedBase.id === action.payload.id) {
          state.selectedBase = action.payload;
        }
      })
      .addCase(editLogisticsBase.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(removeLogisticsBase.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeLogisticsBase.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.logisticsBases = state.logisticsBases.filter(base => base.id !== action.payload);
        if (state.selectedBase && state.selectedBase.id === action.payload) {
          state.selectedBase = null;
        }
      })
      .addCase(removeLogisticsBase.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectCompanyConfig = (state) => state.company.config;
export const selectLogisticsBases = (state) => state.company.logisticsBases;
export const selectSelectedBase = (state) => state.company.selectedBase;
export const selectCompanyStatus = (state) => state.company.status;
export const selectCompanyError = (state) => state.company.error;

// Actions
export const { setSelectedBase, clearSelectedBase } = companySlice.actions;

export default companySlice.reducer;
