import axios from 'axios';

const API_URL = 'http://localhost:4002'; // Upewnij się, że port jest zgodny z resztą aplikacji

// Endpoint dla ustawień TIMOCOM - zmieniono na zasób najwyższego poziomu
const TIMOCOM_SETTINGS_URL = `${API_URL}/timocomSettings`; 

// Pobierz ustawienia TIMOCOM
export const fetchTimocomSettings = async () => {
  try {
    // Zmieniono URL
    const response = await axios.get(TIMOCOM_SETTINGS_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching TIMOCOM settings:', error.name); // Logowanie tylko nazwy błędu
    // Zwracamy null lub pusty obiekt, aby komponent mógł obsłużyć brak danych
    // lub rzucamy błąd, jeśli preferujemy obsługę w komponencie przez .catch()
    // throw error; 
    return null; // Zwracamy null, aby wskazać błąd
  }
};

// Zapisz ustawienia TIMOCOM
export const saveTimocomSettings = async (settings) => {
  try {
    // Używamy PUT, ponieważ /timocomSettings jest pojedynczym zasobem (obiektem), a nie kolekcją
    // Jeśli db.json miałby tablicę timocomSettings, użylibyśmy POST lub PUT z ID
    const response = await axios.put(TIMOCOM_SETTINGS_URL, { 
      ...settings,
      lastUpdated: new Date().toISOString(), 
    });
    return response.data;
  } catch (error) {
    console.error('Error saving TIMOCOM settings:', error.name); // Logowanie tylko nazwy błędu
    throw error; // Rzucamy błąd dalej, aby komponent mógł go obsłużyć
  }
};

// Testuj połączenie z API TIMOCOM
export const testTimocomConnection = async (credentials) => {
    try {
      // Uwaga: Ten endpoint `/test-timocom` musiałby istnieć na Twoim prawdziwym backendzie.
      // json-server go nie obsłuży automatycznie.
      // Dla celów demonstracyjnych symulujemy sukces lub błąd.
      console.log("Testing TIMOCOM connection with:", credentials.username);
      
      // Symulacja wywołania API
      await new Promise(resolve => setTimeout(resolve, 1000)); 
  
      // Symulacja odpowiedzi - zastąp prawdziwą logiką
      if (credentials.username === "test_user" && credentials.password === "test_pass") {
        return { success: true, message: "Połączenie udane" };
      } else {
        // Zwracaj obiekt błędu zgodny z oczekiwaniami komponentu
        // throw new Error("Błędne dane logowania lub problem z API"); 
        return { success: false, message: "Błędne dane logowania lub problem z API" };
      }
    } catch (error) {
      console.error("Error testing TIMOCOM connection:", error);
      // Zwracaj obiekt błędu zgodny z oczekiwaniami komponentu
      // throw error; 
      return { success: false, message: error.message || "Nieznany błąd podczas testowania połączenia" };
    }
  };
