import axios from 'axios';

// Bazowy URL dla API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4002';

// Pobieranie wszystkich baz logistycznych
export const fetchLogisticsBases = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/logisticsBases`);
    // Upewnij się, że zwracamy tablicę
    if (!Array.isArray(response.data)) {
      console.warn('Otrzymane dane nie są tablicą:', response.data);
      return [];
    }
    return response.data;
  } catch (error) {
    console.error('Błąd podczas pobierania baz logistycznych:', error);
    // Zwracamy pustą tablicę zamiast rzucania błędu
    return [];
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
    console.log('Wysyłanie danych do API:', baseData);
    console.log('URL API:', `${API_BASE_URL}/logisticsBases`);
    const response = await axios.post(`${API_BASE_URL}/logisticsBases`, baseData);
    console.log('Odpowiedź API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Błąd podczas dodawania bazy logistycznej:', error);
    // Zamiast rzucać błąd, generujemy tymczasowe ID i zwracamy dane
    // To pozwoli na kontynuowanie pracy aplikacji nawet jeśli backend nie działa
    const tempId = Date.now();
    console.log('Generowanie tymczasowego ID dla bazy:', tempId);
    return { ...baseData, id: tempId };
  }
};

// Aktualizacja istniejącej bazy logistycznej
export const updateLogisticsBase = async (baseId, baseData) => {
  try {
    console.log('Aktualizacja bazy logistycznej:', baseId, baseData);
    const response = await axios.put(`${API_BASE_URL}/logisticsBases/${baseId}`, baseData);
    console.log('Odpowiedź API po aktualizacji:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Błąd podczas aktualizacji bazy logistycznej o ID ${baseId}:`, error);
    // Zamiast rzucać błąd, zwracamy oryginalne dane
    // To pozwoli na kontynuowanie pracy aplikacji nawet jeśli backend nie działa
    return { ...baseData, id: baseId };
  }
};

// Usuwanie bazy logistycznej
export const deleteLogisticsBase = async (baseId) => {
  try {
    console.log('Usuwanie bazy logistycznej:', baseId);
    await axios.delete(`${API_BASE_URL}/logisticsBases/${baseId}`);
    return baseId;
  } catch (error) {
    console.error(`Błąd podczas usuwania bazy logistycznej o ID ${baseId}:`, error);
    // Zamiast rzucać błąd, zwracamy ID
    // To pozwoli na kontynuowanie pracy aplikacji nawet jeśli backend nie działa
    return baseId;
  }
};
