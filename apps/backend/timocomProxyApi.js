// Logika komunikacji z API TIMOCOM (przeniesiona z frontendu)
const axios = require('axios');

// --- Konfiguracja --- 
const TIMOCOM_USERNAME = process.env.TIMOCOM_USERNAME;
const TIMOCOM_PASSWORD = process.env.TIMOCOM_PASSWORD;
const TIMOCOM_API_URL = process.env.TIMOCOM_API_URL || 'https://api.timocom.com'; // Zmieniono domyślny URL na produkcyjny

// Utwórz instancję Axios dla TIMOCOM API
const timocomApiClient = axios.create({
    baseURL: `${TIMOCOM_API_URL}/freight-exchange/3`,
    timeout: 15000, // Zwiększony timeout dla potencjalnie dłuższych zapytań
    headers: {
        'Content-Type': 'application/json',
        // Nagłówek autoryzacyjny zostanie dodany dynamicznie w interceptorze
    }
});

// Interceptor do dodawania nagłówka autoryzacyjnego
timocomApiClient.interceptors.request.use(config => {
    if (TIMOCOM_USERNAME && TIMOCOM_PASSWORD) {
        const credentials = Buffer.from(`${TIMOCOM_USERNAME}:${TIMOCOM_PASSWORD}`).toString('base64');
        config.headers.Authorization = `Basic ${credentials}`;
    } else {
        console.warn('Backend Warning: TIMOCOM credentials are not set in .env file. API calls may fail.');
        // Można rozważyć rzucenie błędu, jeśli dane są absolutnie wymagane
        // throw new Error('TIMOCOM credentials are required but not provided.');
    }
    // Usuwamy niestandardowe nagłówki, które mogą powodować problemy z CORS, jeśli byłyby wysyłane z frontendu
    // delete config.headers['X-Requested-With']; 
    return config;
}, error => {
    return Promise.reject(error);
});

// --- Funkcje API --- 

/**
 * Funkcja pomocnicza do budowania parametrów wyszukiwania.
 * UWAGA: Ta funkcja była wcześniej na frontendzie, teraz jest na backendzie.
 * Może wymagać dostosowania do formatu danych przychodzących z frontendu.
 */
const buildSearchParams = (params) => {
    // Przykładowa implementacja - dostosuj do rzeczywistych potrzeb
    // Załóżmy, że 'params' to obiekt przekazany z frontendu
    console.log("Backend: Building search params with:", params);
    const searchCriteria = {
        pickupAddress: {
            countryCode: params.pickupCountryCode || 'PL', // Domyślnie Polska
            postalCode: params.pickupPostalCode,
            city: params.pickupCity,
        },
        deliveryAddress: {
            countryCode: params.deliveryCountryCode || 'DE', // Domyślnie Niemcy
            postalCode: params.deliveryPostalCode,
            city: params.deliveryCity,
        },
        // Dodaj inne parametry zgodnie z dokumentacją TIMOCOM API V3
        // np. vehicleType, loadingDateRange, etc.
    };
    
    // Usuń puste pola, aby nie wysyłać ich do API
    const cleanup = (obj) => {
        Object.keys(obj).forEach(key => {
            if (obj[key] && typeof obj[key] === 'object') cleanup(obj[key]);
            else if (obj[key] === undefined || obj[key] === null || obj[key] === '') delete obj[key];
        });
    };
    cleanup(searchCriteria);
    
    console.log("Backend: Built search params:", searchCriteria);
    return searchCriteria;
};

/**
 * Pobiera oferty frachtów z zewnętrznego API TIMOCOM.
 * @param {object} searchParams Parametry wyszukiwania (zbudowane przez buildSearchParams)
 * @returns {Promise<object>} Obiekt z danymi { success: boolean, data: array | null, error: string | null }
 */
const fetchExternalTimocomOffers = async (rawSearchParams) => {
    console.log("Backend: fetchExternalTimocomOffers called with:", rawSearchParams);
    if (!TIMOCOM_USERNAME || !TIMOCOM_PASSWORD) {
        console.error('Backend Error: Missing TIMOCOM credentials for fetchExternalTimocomOffers.');
        return { success: false, data: null, error: 'Brak danych logowania TIMOCOM na serwerze.' };
    }
    try {
        // Zbuduj parametry wyszukiwania
        // const finalSearchParams = buildSearchParams(rawSearchParams);
        // Na razie zakładamy, że frontend prześle już poprawnie sformatowany obiekt
        // Jeśli frontend wysyła prostszy obiekt, odkomentuj buildSearchParams i dostosuj
        const finalSearchParams = rawSearchParams; 

        console.log('Backend: Sending request to TIMOCOM /freight-offers/search with params:', JSON.stringify(finalSearchParams));
        const response = await timocomApiClient.post('/freight-offers/search', finalSearchParams);
        
        console.log('Backend: TIMOCOM /freight-offers/search raw response status:', response.status);
        // console.log('Backend: TIMOCOM /freight-offers/search raw response data:', response.data);

        // Sprawdź, czy odpowiedź z Timocom ma oczekiwaną strukturę (status 2xx i obiekt data)
        if (response.status >= 200 && response.status < 300 && response.data && typeof response.data === 'object') {
            // Odpowiedź jest sukcesem, zwracamy cały obiekt response.data, który zawiera meta i payload
            // Serwer nadrzędny (server.js) będzie odpowiedzialny za sprawdzenie payload
            console.log(`Backend: TIMOCOM request successful. Payload contains ${response.data.payload?.length ?? 0} items.`);
            return { success: true, data: response.data, error: null }; 
        } else {
            // Odpowiedź ma nieoczekiwany format lub status inny niż 2xx
            const warningMsg = `Backend Warning: TIMOCOM response format unexpected or status not 2xx. Status: ${response.status}`;
            console.warn(warningMsg, response.data);
            // Zwracamy błąd, ponieważ format jest nieoczekiwany
            return { success: false, data: response.data, error: warningMsg };
        }

    } catch (error) {
        console.error('Backend Error in fetchExternalTimocomOffers:', error.response ? `${error.response.status} ${JSON.stringify(error.response.data)}` : error.message);
        let errorMessage = 'Błąd podczas pobierania ofert z TIMOCOM.';
        let errorDetails = null;

        if (error.response) {
            // Szczegółowa obsługa błędów HTTP
            const statusCode = error.response.status;
            const errorData = error.response.data;
            
            // Loguj pełną strukturę błędu dla celów diagnostycznych
            console.error(`Backend: Timocom API error ${statusCode}:`, JSON.stringify(errorData, null, 2));
            
            // Obsługa błędu 422 - Unprocessable Entity (błędy walidacji)
            if (statusCode === 422 && errorData) {
                errorMessage = errorData.title || 'Problem: Constraints are violated.';
                
                // Zbierz szczegółowe informacje o błędach walidacji
                if (errorData.detail) {
                    errorMessage += ` ${errorData.detail}`;
                }
                
                // Zbierz informacje o nieprawidłowych parametrach
                if (Array.isArray(errorData['invalid-params']) && errorData['invalid-params'].length > 0) {
                    const invalidParams = errorData['invalid-params'].map(param => 
                        `${param.name}: ${param.reason}`
                    ).join(', ');
                    
                    errorDetails = {
                        type: errorData.type || 'ValidationError',
                        invalidParams: errorData['invalid-params'],
                        message: `Invalid parameters: ${invalidParams}`,
                        title: errorData.title || 'Validation Error'
                    };
                    
                    // Dodaj bardziej przyjazne dla użytkownika komunikaty dla typowych błędów walidacji
                    errorDetails.invalidParams.forEach(param => {
                        if (param.name === 'exclusiveLeftLowerBoundDateTime' && param.reason.includes('must not be null')) {
                            param.userFriendlyMessage = 'Wymagany jest początkowy czas wyszukiwania.';
                        } else if (param.name === 'inclusiveRightUpperBoundDateTime' && param.reason.includes('must not be null')) {
                            param.userFriendlyMessage = 'Wymagany jest końcowy czas wyszukiwania.';
                        } else if (param.name.includes('DateTime') && param.reason.includes('format')) {
                            param.userFriendlyMessage = 'Nieprawidłowy format daty/czasu. Wymagany format: ISO 8601 (np. 2023-01-01T12:00:00Z).';
                        } else {
                            param.userFriendlyMessage = `Błąd parametru: ${param.reason}`;
                        }
                    });
                }
            } else if (errorData && typeof errorData === 'object') {
                // Obsługa innych błędów API
                errorMessage = errorData.title || errorData.message || JSON.stringify(errorData);
                errorDetails = errorData;
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
        } else if (error.request) {
            errorMessage = 'Brak odpowiedzi z serwera TIMOCOM.';
        } else {
            errorMessage = error.message;
        }
        
        return { 
            success: false, 
            data: null, 
            error: errorMessage, 
            details: errorDetails 
        };
    }
};

/**
 * Testuje połączenie z API TIMOCOM przez wykonanie prostego zapytania (np. wyszukanie z limitem 1).
 * @returns {Promise<object>} Obiekt { success: boolean, message: string, error: string | null, status: number | null }
 */
const testExternalTimocomConnection = async () => {
    console.log("Backend: testExternalTimocomConnection called.");
    if (!TIMOCOM_USERNAME || !TIMOCOM_PASSWORD) {
        console.error('Backend Error: Missing TIMOCOM credentials for testExternalTimocomConnection.');
        return { success: false, error: 'Brak danych logowania TIMOCOM na serwerze.', status: 401 };
    }
    try {
        // Przygotowujemy bardziej szczegółowy payload, zgodny z przykładem
        // Zgodnie z przykładem z dokumentacji
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const isoDateTime = tomorrow.toISOString(); // Format YYYY-MM-DDTHH:mm:ss.sssZ

        const testPayload = {
          startLocation: {
            objectType: "areaSearch",
            area: {
              address: {
                objectType: "address",
                city: "Berlin", // Zmieniono na Berlin
                postalCode: "10117", // Przykładowy kod dla Berlina
                country: "DE"
              },
              size_km: 50
            }
          },
          destinationLocation: {
            objectType: "areaSearch",
            area: {
              address: {
                objectType: "address",
                city: "München",
                postalCode: "80331",
                country: "DE"
              },
              size_km: 50
            }
          },
          inclusiveRightUpperBoundDateTime: isoDateTime
        };

        console.log('Sending test payload based on documentation to TIMOCOM:', JSON.stringify(testPayload, null, 2));

        const response = await timocomApiClient.post('/freight-offers/search', testPayload); // Nadal prosimy tylko o 1 wynik dla testu
        
        console.log('TIMOCOM API test connection successful, status:', response.status);
        // Sprawdzamy, czy odpowiedź jest sukcesem (status 2xx)
        if (response.status >= 200 && response.status < 300) {
          return { 
            success: true, 
            status: response.status, 
            message: 'Połączenie z API TIMOCOM (przez proxy) działa poprawnie.',
            // Można dodać fragment danych, jeśli są dostępne i użyteczne
            dataPreview: response.data?.length > 0 ? response.data[0] : 'Brak ofert w odpowiedzi testowej.'
          }; 
        } else {
          // Rzadki przypadek, gdy status nie jest 2xx ale nie rzucono błędu
          return { success: false, status: response.status, error: `Nieoczekiwany status odpowiedzi TIMOCOM: ${response.status}` };
        }

    } catch (error) {
        console.error('Error testing TIMOCOM API connection:', error.message);
        // Logujemy więcej szczegółów błędu, jeśli są dostępne
        if (error.response) {
          console.error('TIMOCOM Error Response Status:', error.response.status);
          console.error('TIMOCOM Error Response Data:', JSON.stringify(error.response.data, null, 2));
          return { 
            success: false, 
            error: `Test połączenia TIMOCOM nie powiódł się. Status: ${error.response.status}. Problem: ${error.response.data?.message || error.response.data?.title || error.message}`,
            status: error.response.status, // Zwracamy status błędu TIMOCOM
            rawError: error // Uproszczony błąd Axios
          };
        } else {
          // Błąd sieciowy lub inny problem przed odpowiedzią z serwera
          return { 
            success: false, 
            error: `Test połączenia TIMOCOM nie powiódł się.: ${error.message}`,
            status: 500, // Uznajemy za błąd serwera proxy lub sieci
            rawError: error
          };
        }
    }
};

// Eksportuj funkcje ORAZ klienta API, które będą używane przez server.js
module.exports = {
    testExternalTimocomConnection,
    fetchExternalTimocomOffers,
    timocomApiClient // Dodano eksport instancji klienta
};
