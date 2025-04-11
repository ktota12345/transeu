import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4002'; // Upewnij się, że port jest zgodny z resztą aplikacji

// Endpoint dla ustawień TIMOCOM - zmieniono na zasób najwyższego poziomu
const TIMOCOM_SETTINGS_URL = `${API_URL}/timocomSettings`; 

// Pobierz ustawienia TIMOCOM
export const fetchTimocomSettings = async () => {
  try {
    // Zmieniono URL
    const response = await axios.get(TIMOCOM_SETTINGS_URL);
    
    // Jeśli w odpowiedzi są placeholdery oznaczające użycie zmiennych środowiskowych, zastąp je
    const settings = response.data;
    
    // Zastępowanie placeholderów wartościami ze zmiennych środowiskowych
    if (settings.username === '[USE_ENV_TIMOCOM_USERNAME]') {
      settings.username = process.env.REACT_APP_TIMOCOM_USERNAME || '';
    }
    
    if (settings.password === '[USE_ENV_TIMOCOM_PASSWORD]') {
      settings.password = process.env.REACT_APP_TIMOCOM_PASSWORD || '';
    }
    
    if (settings.apiKey === '[USE_ENV_TIMOCOM_API_KEY]') {
      settings.apiKey = process.env.REACT_APP_TIMOCOM_API_KEY || '';
    }
    
    if (settings.refreshToken === '[USE_ENV_TIMOCOM_REFRESH_TOKEN]') {
      settings.refreshToken = process.env.REACT_APP_TIMOCOM_REFRESH_TOKEN || '';
    }
    
    return settings;
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
    // Przygotowanie danych do zapisania - używanie placeholderów dla danych, które będą pochodzą
    // ze zmiennych środowiskowych
    const settingsToSave = {
      ...settings,
      lastUpdated: new Date().toISOString()
    };
    
    // Zapisujemy placeholdery zamiast rzeczywistych danych uwierzytelniających
    // Jeśli mamy dane, które powinny pochodzić ze zmiennych środowiskowych
    if (settingsToSave.username) {
      // Zapisz do zmiennej środowiskowej przy kolejnym uruchomieniu
      console.log('Zapisana nazwa użytkownika powinna zostać przeniesiona do zmiennej środowiskowej REACT_APP_TIMOCOM_USERNAME');
      settingsToSave.username = '[USE_ENV_TIMOCOM_USERNAME]';
    }
    
    if (settingsToSave.password) {
      // Zapisz do zmiennej środowiskowej przy kolejnym uruchomieniu
      console.log('Zapisane hasło powinno zostać przeniesione do zmiennej środowiskowej REACT_APP_TIMOCOM_PASSWORD');
      settingsToSave.password = '[USE_ENV_TIMOCOM_PASSWORD]';
    }
    
    if (settingsToSave.apiKey) {
      // Zapisz do zmiennej środowiskowej przy kolejnym uruchomieniu
      console.log('Zapisany klucz API powinien zostać przeniesiony do zmiennej środowiskowej REACT_APP_TIMOCOM_API_KEY');
      settingsToSave.apiKey = '[USE_ENV_TIMOCOM_API_KEY]';
    }
    
    if (settingsToSave.refreshToken) {
      // Zapisz do zmiennej środowiskowej przy kolejnym uruchomieniu
      console.log('Zapisany token odświeżania powinien zostać przeniesiony do zmiennej środowiskowej REACT_APP_TIMOCOM_REFRESH_TOKEN');
      settingsToSave.refreshToken = '[USE_ENV_TIMOCOM_REFRESH_TOKEN]';
    }
    
    // Używamy PUT, ponieważ /timocomSettings jest pojedynczym zasobem (obiektem), a nie kolekcją
    const response = await axios.put(TIMOCOM_SETTINGS_URL, settingsToSave);
    
    // Informowanie o potrzebie zaktualizowania zmiennych środowiskowych
    alert('Dane uwierzytelniające zostały zapisane. Ze względów bezpieczeństwa, przeniej je do zmiennych środowiskowych w pliku .env.');
    
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
