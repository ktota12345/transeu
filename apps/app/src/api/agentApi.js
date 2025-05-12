import axios from 'axios';
import axiosNest from './axiosNest';

const API_URL = process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:3002/api';

// Pobieranie wszystkich agentów
export const fetchAgents = async () => {
  try {
    const response = await axiosNest.get(`/agents`);
    return response.data;
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

// Pobieranie pojedynczego agenta
export const fetchAgent = async (id) => {
  try {
    const response = await axiosNest.get(`/agents/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching agent with id ${id}:`, error);
    throw error;
  }
};

// Dodawanie nowego agenta
export const createAgent = async (agentData) => {
  try {
    const response = await axiosNest.post(`/agents`, {
      ...agentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating agent:', error);
    throw error;
  }
};

// Aktualizacja agenta
export const updateAgent = async (id, agentData) => {
  try {
    const response = await axiosNest.put(`/agents/${id}`, {
      ...agentData,
      updatedAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating agent with id ${id}:`, error);
    throw error;
  }
};

// Usuwanie agenta
export const deleteAgent = async (id) => {
  try {
    await axiosNest.delete(`/agents/${id}`);
    return { success: true, id };
  } catch (error) {
    console.error(`Error deleting agent with id ${id}:`, error);
    throw error;
  }
};

// Sprawdzenie, czy agent istnieje w bazie
export const checkIfAgentExists = async (id) => {
  try {
    const response = await axiosNest.get(`/agents/${id}`);
    return { exists: true, data: response.data };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { exists: false };
    }
    throw error;
  }

};
