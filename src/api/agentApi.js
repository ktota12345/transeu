import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:4002';

// Pobieranie wszystkich agentów
export const fetchAgents = async () => {
  try {
    const response = await axios.get(`${API_URL}/agents`);
    return response.data;
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

// Pobieranie pojedynczego agenta
export const fetchAgent = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/agents/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching agent with id ${id}:`, error);
    throw error;
  }
};

// Dodawanie nowego agenta
export const createAgent = async (agentData) => {
  try {
    // Ensure selectedLogisticsBase is a number if it exists
    const dataToSend = {
      ...agentData,
      selectedLogisticsBase: agentData.selectedLogisticsBase ? parseInt(agentData.selectedLogisticsBase, 10) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const response = await axios.post(`${API_URL}/agents`, dataToSend);
    return response.data;
  } catch (error) {
    console.error('Error creating agent:', error);
    throw error;
  }
};

// Aktualizacja agenta
export const updateAgent = async (id, agentData) => {
  try {
    // Ensure selectedLogisticsBase is a number if it exists
    const dataToSend = {
        ...agentData,
        selectedLogisticsBase: agentData.selectedLogisticsBase ? parseInt(agentData.selectedLogisticsBase, 10) : null,
        updatedAt: new Date().toISOString()
    };
    const response = await axios.put(`${API_URL}/agents/${id}`, dataToSend);
    return response.data;
  } catch (error) {
    console.error(`Error updating agent with id ${id}:`, error);
    throw error;
  }
};

// Usuwanie agenta
export const deleteAgent = async (id) => {
  try {
    await axios.delete(`${API_URL}/agents/${id}`);
    return { success: true, id };
  } catch (error) {
    console.error(`Error deleting agent with id ${id}:`, error);
    throw error;
  }
};

// Sprawdzenie, czy agent istnieje w bazie
export const checkIfAgentExists = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/agents/${id}`);
    return { exists: true, data: response.data };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { exists: false };
    }
    throw error;
  }
};
