import axios from 'axios';

// --- Konfiguracja Zewnętrznego API TIMOCOM ---
const TIMOCOM_API_URL = process.env.REACT_APP_TIMOCOM_API_URL || 'https://sandbox.timocom.com'; // Używaj zmiennej środowiskowej
const FREIGHT_OFFERS_ENDPOINT = '/freight-exchange/3/freight-offers/search';
const FREIGHT_OFFER_DETAILS_ENDPOINT = '/freight-exchange/3/freight-offers';

// Klucze do przechowywania danych w localStorage (rozważ bezpieczniejszą alternatywę)
const LOCAL_STORAGE_KEYS = {
  username: 'timocom_username',
  password: 'timocom_password',
  enabled: 'timocom_enabled'
};

/**
 * Pobiera poświadczenia TIMOCOM z localStorage lub zmiennych środowiskowych.
 * UWAGA: Usunięto twardo zakodowane wartości domyślne. Upewnij się, że zmienne środowiskowe
 * lub localStorage są poprawnie ustawione.
 * Rozważ bezpieczniejsze przechowywanie poświadczeń niż localStorage.
 */
const getTimocomCredentials = () => {
  let username = localStorage.getItem(LOCAL_STORAGE_KEYS.username);
  let password = localStorage.getItem(LOCAL_STORAGE_KEYS.password);

  if (!username) {
    username = process.env.REACT_APP_TIMOCOM_USERNAME;
  }
  if (!password) {
    password = process.env.REACT_APP_TIMOCOM_PASSWORD;
  }

  if (!username || !password) {
     console.warn('TIMOCOM API credentials not found. Set them in Settings or environment variables.');
  }

  return { username, password };
};

// Klient Axios dla zewnętrznego API TIMOCOM
const timocomApiClient = axios.create({
  baseURL: TIMOCOM_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000
});

// Interceptor dodający nagłówek Basic Auth do każdego żądania
timocomApiClient.interceptors.request.use(config => {
  const { username, password } = getTimocomCredentials();

  if (username && password) {
    const auth = 'Basic ' + window.btoa(`${username}:${password}`);
    config.headers.Authorization = auth;
    console.log('Dodano nagłówek autoryzacji do żądania TIMOCOM');
    console.log('URL:', config.url);
    console.log('Użytkownik:', username); // Zachowaj ostrożność przy logowaniu nazwy użytkownika
  } else {
    // Błąd zostanie zgłoszony przez funkcje wywołujące, jeśli credentials są wymagane
  }
  return config;
}, error => {
  console.error("Błąd interceptora żądania TIMOCOM:", error);
  return Promise.reject(error);
});

/**
 * Buduje parametry wyszukiwania dla API TIMOCOM na podstawie konfiguracji agenta.
 * @param {Object} agentConfig - Konfiguracja agenta.
 * @param {Object} logisticsBase - Dane wybranej bazy logistycznej.
 * @param {Object} destinationCity - Dane miasta docelowego (jeśli dotyczy).
 * @returns {Object} - Parametry wyszukiwania dla API TIMOCOM.
 */
const buildSearchParams = (agentConfig = {}, logisticsBase = null, destinationCity = null) => {
  const {
    maxOperatingRadius = 100,
    liftCapacityRange = {},
    cargoParameters = {},
    timocomSettings = {}
  } = agentConfig;
  const { startSearchRadius = 50, destinationSearchRadius = 50 } = timocomSettings;

  const searchParams = {
    firstResult: 0,
    maxResults: 20, // Można to uczynić konfigurowalnym
    inclusiveRightUpperBoundDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Stały zakres 7 dni
  };

  // --- Lokalizacja Startowa (Baza Logistyczna) ---
  if (logisticsBase && logisticsBase.address) {
      searchParams.startLocation = {
          objectType: "areaSearch",
          area: {
              address: {
                  objectType: "address",
                  // Użyj danych z bazy logistycznej
                  city: logisticsBase.address.city,
                  country: logisticsBase.address.country,
                  postalCode: logisticsBase.address.postalCode || ''
              },
              // Użyj promienia z konfiguracji agenta lub ustawień TIMOCOM
              size_km: parseInt(startSearchRadius || maxOperatingRadius, 10) || 50
          }
      };
  } else {
      // TODO: Zaimplementuj fallback lub zgłoś błąd, jeśli baza logistyczna jest wymagana, a nie została podana.
      // Na razie używamy wartości domyślnych (jak poprzednio), ale to powinno być naprawione.
      console.warn("Brak danych bazy logistycznej w buildSearchParams, używam domyślnego Berlina.");
      searchParams.startLocation = {
          objectType: "areaSearch",
          area: {
              address: { objectType: "address", city: "Berlin", country: "DE", postalCode: "10115" },
              size_km: 100
          }
      };
  }

  // --- Lokalizacja Docelowa (Miasto Docelowe) ---
  if (destinationCity && destinationCity.name && destinationCity.country) {
      searchParams.destinationLocation = {
          objectType: "areaSearch",
          area: {
              address: {
                  objectType: "address",
                  city: destinationCity.name,
                  country: destinationCity.country,
                  postalCode: destinationCity.postalCode || ''
              },
              size_km: parseInt(destinationSearchRadius, 10) || 50
          }
      };
  } else {
       // TODO: Zaimplementuj fallback lub zgłoś błąd, jeśli miasto docelowe jest wymagane, a nie zostało podane.
      // Na razie używamy wartości domyślnych (jak poprzednio), ale to powinno być naprawione.
       console.warn("Brak danych miasta docelowego w buildSearchParams, używam domyślnego Monachium.");
      searchParams.destinationLocation = {
          objectType: "areaSearch",
          area: {
              address: { objectType: "address", city: "München", country: "DE", postalCode: "80331" },
              size_km: 100
          }
      };
  }

  // --- Wymagania Pojazdu ---
  if (liftCapacityRange.min) {
    searchParams.vehicleRequirements = {
      ...searchParams.vehicleRequirements,
      liftCapacity: {
        min: parseInt(liftCapacityRange.min, 10) || 0
      }
    };
    if (liftCapacityRange.max) {
      searchParams.vehicleRequirements.liftCapacity.max = parseInt(liftCapacityRange.max, 10);
    }
  }

  // --- Wymagania Ładunku ---
  if (Object.keys(cargoParameters).length > 0) {
      searchParams.cargoRequirements = {};
      if (cargoParameters.width) searchParams.cargoRequirements.width = { min: parseInt(cargoParameters.width, 10) || 0 };
      if (cargoParameters.height) searchParams.cargoRequirements.height = { min: parseInt(cargoParameters.height, 10) || 0 };
      if (cargoParameters.length) searchParams.cargoRequirements.length = { min: parseInt(cargoParameters.length, 10) || 0 };
      if (cargoParameters.weight) searchParams.cargoRequirements.weight = { min: parseInt(cargoParameters.weight, 10) || 0 };
  }

  return searchParams;
};


/**
 * Wykonuje zapytanie o oferty frachtu do zewnętrznego API TIMOCOM.
 * Nie zapisuje danych do wewnętrznego cache.
 * @param {Object} searchParams - Gotowe parametry wyszukiwania.
 * @returns {Promise<Array>} - Lista ofert frachtu z API TIMOCOM.
 * @throws {Error} - Jeśli zapytanie się nie powiedzie lub brakuje poświadczeń.
 */
export const fetchExternalTimocomOffers = async (searchParams) => {
  const { username, password } = getTimocomCredentials();
  if (!username || !password) {
    throw new Error('TIMOCOM API credentials are required.');
  }

  console.log('Wysyłanie zapytania do zewnętrznego API TIMOCOM:', JSON.stringify(searchParams, null, 2));

  try {
    const response = await timocomApiClient.post(FREIGHT_OFFERS_ENDPOINT, searchParams);
    console.log('Odpowiedź z zewnętrznego API TIMOCOM:', response.status);
    console.log('Liczba znalezionych ofert:', response.data?.length || 0);
    return response.data || []; // Zwraca tylko dane ofert
  } catch (error) {
    console.error('Błąd podczas pobierania ofert z zewnętrznego API TIMOCOM:', error);
    // Rzucamy błąd dalej, aby obsłużyć go w adapterze
    throw error;
  }
};

/**
 * Pobiera szczegóły konkretnej oferty frachtu z zewnętrznego API TIMOCOM.
 * @param {string} offerId - ID oferty.
 * @returns {Promise<Object>} - Szczegóły oferty.
 * @throws {Error} - Jeśli zapytanie się nie powiedzie.
 */
export const fetchExternalTimocomOfferDetails = async (offerId) => {
  if (!offerId) throw new Error("Offer ID is required.");

  try {
    const url = `${FREIGHT_OFFER_DETAILS_ENDPOINT}/${offerId}`;
    console.log(`Pobieranie szczegółów oferty ${offerId} z TIMOCOM...`);
    const response = await timocomApiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(`Błąd podczas pobierania szczegółów oferty TIMOCOM ${offerId}:`, error);
    throw error;
  }
};

/**
 * Testuje połączenie z zewnętrznym API TIMOCOM wykonując zapytanie testowe.
 * Nie zapisuje danych do wewnętrznego cache.
 * @param {Object} testParams - Opcjonalne parametry do testowego zapytania.
 * @returns {Promise<Object>} - Wynik testu (sukces/błąd, status, dane).
 */
export const testExternalTimocomConnection = async (testParams = null) => {
   const { username, password } = getTimocomCredentials();
   if (!username || !password) {
       return { success: false, error: 'Brak danych uwierzytelniających TIMOCOM.', status: 401 };
   }

  // Użyj buildSearchParams do stworzenia parametrów testowych lub użyj domyślnych, jeśli testParams nie podano
   const defaultTestParams = {
       maxOperatingRadius: 100, // Przykładowy promień
       // Można dodać inne domyślne parametry agenta, jeśli potrzebne
   };
   const searchParams = buildSearchParams(testParams || defaultTestParams);
   // Ogranicz liczbę wyników dla testu
   searchParams.maxResults = 5;

   console.log('Testowanie połączenia z zewnętrznym API TIMOCOM...');
   console.log(`URL: ${TIMOCOM_API_URL}${FREIGHT_OFFERS_ENDPOINT}`);
   console.log('Parametry testowe:', JSON.stringify(searchParams, null, 2));

   try {
       const response = await timocomApiClient.post(FREIGHT_OFFERS_ENDPOINT, searchParams);
       console.log('Odpowiedź testowa z TIMOCOM:', response.status);
       return {
           success: true,
           status: response.status,
           data: response.data || []
       };
   } catch (error) {
       console.error('Test połączenia TIMOCOM nie powiódł się:', error);
       let errorMessage = 'Nieznany błąd połączenia.';
       let status = error.response?.status || 500;

       if (error.response) {
           errorMessage = `Błąd serwera: ${status} - ${error.response.statusText}`;
           if (status === 401) errorMessage = 'Błąd uwierzytelniania. Sprawdź dane logowania.';
           else if (status === 403) errorMessage = 'Brak uprawnień do API TIMOCOM.';
           else if (status === 404) errorMessage = 'Nieprawidłowy adres API TIMOCOM.';
       } else if (error.request) {
           errorMessage = 'Brak odpowiedzi z serwera TIMOCOM.';
           if (error.code === 'ECONNABORTED') errorMessage = 'Timeout połączenia z TIMOCOM.';
           else if (error.code === 'ENOTFOUND') errorMessage = 'Nie można znaleźć serwera TIMOCOM.';
           else if (error.code === 'ERR_NETWORK') errorMessage = 'Błąd sieci przy połączeniu z TIMOCOM.';
           status = 503; // Service Unavailable
       } else {
           errorMessage = `Błąd konfiguracji zapytania: ${error.message}`;
       }
       return { success: false, error: errorMessage, status: status, rawError: error };
   }
};

// Eksportuj tylko potrzebne funkcje i stałe, które nie są eksportowane inline
export {
    getTimocomCredentials, // Nie jest exportowane inline
    buildSearchParams,     // Nie jest exportowane inline
};
