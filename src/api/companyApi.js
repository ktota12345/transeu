import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:4002/api';

/**
 * Pobieranie konfiguracji firmy
 * @returns {Promise<Object>} - Konfiguracja firmy
 */
export const fetchCompanyConfig = async () => {
  try {
    const response = await axios.get(`${API_URL}/company-config`);
    return response.data;
  } catch (error) {
    console.error('Error fetching company configuration:', error);
    throw error;
  }
};

/**
 * Aktualizacja konfiguracji firmy
 * @param {Object} configData - Nowe dane konfiguracyjne
 * @returns {Promise<Object>} - Zaktualizowana konfiguracja
 */
export const updateCompanyConfig = async (configData) => {
  try {
    const response = await axios.put(`${API_URL}/company-config`, {
      ...configData,
      updatedAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating company configuration:', error);
    throw error;
  }
};

/**
 * Pobieranie listy baz logistycznych
 * @returns {Promise<Array>} - Lista baz logistycznych
 */
export const fetchLogisticsBases = async () => {
  try {
    const response = await axios.get(`${API_URL}/logistics-bases`);
    return response.data;
  } catch (error) {
    console.error('Error fetching logistics bases:', error);
    throw error;
  }
};

/**
 * Pobieranie pojedynczej bazy logistycznej
 * @param {string} id - ID bazy logistycznej
 * @returns {Promise<Object>} - Dane bazy logistycznej
 */
export const fetchLogisticsBase = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/logistics-bases/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching logistics base with id ${id}:`, error);
    throw error;
  }
};

/**
 * Dodawanie nowej bazy logistycznej
 * @param {Object} baseData - Dane bazy logistycznej
 * @returns {Promise<Object>} - Utworzona baza logistyczna
 */
export const createLogisticsBase = async (baseData) => {
  try {
    const response = await axios.post(`${API_URL}/logistics-bases`, {
      ...baseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating logistics base:', error);
    throw error;
  }
};

/**
 * Aktualizacja bazy logistycznej
 * @param {string} id - ID bazy logistycznej
 * @param {Object} baseData - Nowe dane bazy
 * @returns {Promise<Object>} - Zaktualizowana baza logistyczna
 */
export const updateLogisticsBase = async (id, baseData) => {
  try {
    const response = await axios.put(`${API_URL}/logistics-bases/${id}`, {
      ...baseData,
      updatedAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating logistics base with id ${id}:`, error);
    throw error;
  }
};

/**
 * Usuwanie bazy logistycznej
 * @param {string} id - ID bazy logistycznej
 * @returns {Promise<Object>} - Wynik operacji
 */
export const deleteLogisticsBase = async (id) => {
  try {
    await axios.delete(`${API_URL}/logistics-bases/${id}`);
    return { success: true, id };
  } catch (error) {
    console.error(`Error deleting logistics base with id ${id}:`, error);
    throw error;
  }
};
