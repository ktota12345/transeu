import axios from 'axios';

// Bazowy URL dla API
const API_BASE_URL = 'http://localhost:4002';

// Pobieranie wszystkich baz logistycznych
export const fetchLogisticsBases = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/logisticsBases`);
    return response.data;
  } catch (error) {
    console.error('Błąd podczas pobierania baz logistycznych:', error);
    throw error;
  }
};

// Pobieranie pojedynczej bazy logistycznej
export const fetchLogisticsBaseById = async (baseId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/logisticsBases/${baseId}`);
    return response.data;
  } catch (error) {
    console.error(`Błąd podczas pobierania bazy logistycznej o ID ${baseId}:`, error);
    throw error;
  }
};

// Dodawanie nowej bazy logistycznej
export const addLogisticsBase = async (baseData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/logisticsBases`, baseData);
    return response.data;
  } catch (error) {
    console.error('Błąd podczas dodawania bazy logistycznej:', error);
    throw error;
  }
};

// Aktualizacja istniejącej bazy logistycznej
export const updateLogisticsBase = async (baseId, baseData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/logisticsBases/${baseId}`, baseData);
    return response.data;
  } catch (error) {
    console.error(`Błąd podczas aktualizacji bazy logistycznej o ID ${baseId}:`, error);
    throw error;
  }
};

// Usuwanie bazy logistycznej
export const deleteLogisticsBase = async (baseId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/logisticsBases/${baseId}`);
    return response.data;
  } catch (error) {
    console.error(`Błąd podczas usuwania bazy logistycznej o ID ${baseId}:`, error);
    throw error;
  }
};
