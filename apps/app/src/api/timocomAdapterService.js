// Serwis adaptera TIMOCOM - Orkiestruje przepływ między frontendem, backendem proxy i wewnętrznym cachem
import axios from 'axios';
// Zaktualizowane importy z internalTimocomCache
import {
    fetchCachedTimocomOffers, // Poprawiona nazwa
    saveTimocomOffersToCache, // Poprawiona nazwa
} from './internalTimocomCache';

// URL naszego backendu proxy (z pliku .env frontendu lub domyślny)
const PROXY_API_URL = process.env.REACT_APP_PROXY_API_URL || 'http://localhost:5000'; 

// --- Funkcje pomocnicze --- 

/**
 * Usuwa duplikaty ofert na podstawie pola 'id'.
 * @param {Array<Object>} offers - Tablica ofert.
 * @returns {Array<Object>} - Tablica ofert bez duplikatów.
 */
const clearDuplicateOffers = (offers) => {
    if (!Array.isArray(offers)) return [];
    const seenIds = new Set();
    return offers.filter(offer => {
        if (!offer || typeof offer.id === 'undefined') {
            return false; // Pomiń nieprawidłowe oferty
        }
        if (seenIds.has(offer.id)) {
            return false; // Już widzieliśmy to ID
        }
        seenIds.add(offer.id);
        return true; // To jest unikalna oferta
    });
};

// --- Funkcje publiczne adaptera --- 

/**
 * Testuje połączenie z API TIMOCOM za pośrednictwem backendu proxy.
 * @returns {Promise<object>} Obiekt { success: boolean, message?: string, error?: string, status?: number }
 */
export const testTimocomConnection = async () => {
    console.log('Adapter: Calling backend proxy /test-connection...');
    try {
        const response = await axios.post(`${PROXY_API_URL}/test-connection`);
        console.log('Adapter: Backend proxy /test-connection response:', response.data);
        // Zwracamy dane bezpośrednio z odpowiedzi proxy
        return response.data; 
    } catch (error) {
        console.error('Adapter: Error calling backend proxy /test-connection:', error.response ? error.response.data : error.message);
        // Zwracamy bardziej szczegółowy błąd, jeśli backend go dostarczył
        const errorData = error.response?.data || {};
        const status = error.response?.status || 500;
        return {
            success: false,
            error: errorData.error || 'Błąd komunikacji z serwerem proxy podczas testu połączenia.',
            details: errorData.details,
            status: status
        };
    }
};

/**
 * Pobiera oferty TIMOCOM dla wszystkich miejsc docelowych zdefiniowanych w agencie.
 * Najpierw próbuje przez backend proxy (który łączy się z TIMOCOM API V3).
 * Jeśli wystąpi błąd, próbuje pobrać zapisane oferty z wewnętrznego cache.
 * @param {object} agentConfig Konfiguracja agenta (zawiera m.in. timocomSettings)
 * @param {object} startLocation Obiekt bazy logistycznej (zawiera city, postalCode, countryCode)
 * @param {object} germanStateCities Mapa landów i miast w Niemczech (może być nieużywana, jeśli proxy nie wymaga)
 * @returns {Promise<object>} Obiekt { data: array | null, source: 'live' | 'cache' | 'error' | 'partial', errors?: string[], combinedError?: string }
 */
// Uwaga: parametr germanStateCities może nie być już potrzebny, jeśli logika wyboru miast
// została przeniesiona całkowicie do agentConfig.timocomSettings.destinationCities.
// Zostawiam go na razie dla kompatybilności.
export const fetchOffersForAllDestinations = async (agentConfig, startLocation, germanStateCities) => {
    const allErrors = [];
    let combinedData = [];
    let finalSource = 'error'; // Domyślnie, jeśli nic się nie uda

    if (!agentConfig || !agentConfig.timocomSettings || !startLocation) {
        return { data: null, source: 'error', combinedError: 'Brak konfiguracji agenta lub lokalizacji startowej.' };
    }

    const { destinationCities } = agentConfig.timocomSettings;
    if (!destinationCities || destinationCities.length === 0) {
        return { data: [], source: 'live', combinedError: 'Brak zdefiniowanych miast docelowych.' }; // Zwracamy pustą tablicę, bo nie ma czego szukać
    }

    console.log(`Adapter: Fetching offers for ${destinationCities.length} destinations via proxy...`);

    const fetchPromises = destinationCities.map(async (destination) => {
        // Upewnij się, że destination jest obiektem z potrzebnymi polami
        if (!destination || !destination.city) {
            console.warn('Adapter: Skipping invalid destination object:', destination);
            return { success: false, error: 'Nieprawidłowy obiekt miasta docelowego.', source: 'error' };
        }

        const searchParams = {
            pickupAddress: {
                countryCode: startLocation.countryCode || 'PL',
                postalCode: startLocation.postalCode,
                city: startLocation.city,
            },
            deliveryAddress: {
                countryCode: destination.countryCode || 'DE', // Użyj kodu kraju z obiektu destination lub domyślnego
                postalCode: destination.postalCode, // Użyj kodu pocztowego z obiektu destination
                city: destination.city,            // Użyj miasta z obiektu destination
            },
            // TODO: Dodaj inne parametry z agentConfig.timocomSettings jeśli backend ich wymaga
        };

        console.log(`Adapter: Calling backend proxy /search-offers for destination: ${destination.city}`);
        try {
            const response = await axios.post(`${PROXY_API_URL}/search-offers`, { searchParams });
            console.log(`Adapter: Backend proxy /search-offers response for ${destination.city}:`, response.data);

            if (response.data.success && response.data.data) {
                const offersWithQueryInfo = response.data.data.map(offer => ({ 
                    ...offer, 
                    _queryOrigin: startLocation.city, 
                    _queryDestination: destination.city 
                }));
                return { success: true, data: offersWithQueryInfo, source: 'live' };
            } else {
                const errorMsg = `Błąd pobierania ofert dla ${destination.city} przez proxy: ${response.data.error || 'Nieznany błąd proxy'}`;
                console.error(errorMsg);
                allErrors.push(errorMsg);
                return { success: false, error: errorMsg, source: 'error' };
            }
        } catch (error) {
            const errorMsg = `Błąd sieci przy zapytaniu /search-offers dla ${destination.city}: ${error.response?.data?.error || error.message}`;
            console.error(errorMsg, error.response?.data);
            allErrors.push(errorMsg);
            return { success: false, error: errorMsg, source: 'error' };
        }
    });

    const results = await Promise.all(fetchPromises);

    let liveDataFetched = false;
    results.forEach(result => {
        if (result.success && result.data) {
            combinedData.push(...result.data);
            liveDataFetched = true;
        }
    });

    if (liveDataFetched) {
        finalSource = allErrors.length > 0 ? 'partial' : 'live'; 
        console.log(`Adapter: Fetched ${combinedData.length} offers from live source (${finalSource}). Saving to cache...`);
        // Użyj lokalnej funkcji clearDuplicateOffers przed zapisem
        const uniqueOffers = clearDuplicateOffers(combinedData); 
        console.log(`Adapter: Saving ${uniqueOffers.length} unique offers to cache.`);
        // Użyj poprawnej nazwy funkcji saveTimocomOffersToCache
        await saveTimocomOffersToCache(uniqueOffers); 
    } else {
        console.warn("Adapter: Failed to fetch any offers from live source. Trying cache...");
        allErrors.push("Nie udało się pobrać żadnych ofert z API TIMOCOM (przez proxy). Spróbowano użyć cache.");
        try {
            // Użyj poprawnej nazwy funkcji fetchCachedTimocomOffers
            const cachedOffers = await fetchCachedTimocomOffers();
            if (cachedOffers && cachedOffers.length > 0) {
                console.log(`Adapter: Found ${cachedOffers.length} offers in cache.`);
                // Przefiltruj duplikaty również z cache na wszelki wypadek
                combinedData = clearDuplicateOffers(cachedOffers); 
                finalSource = 'cache';
            } else {
                console.log("Adapter: Cache is empty.");
                finalSource = 'error'; 
            }
        } catch (cacheError) {
            console.error("Adapter: Error reading from cache:", cacheError);
            allErrors.push(`Błąd odczytu z cache: ${cacheError.message}`);
            finalSource = 'error';
        }
    }
    
    const response = {
        // Użyj lokalnej funkcji clearDuplicateOffers na finalnym wyniku
        data: combinedData.length > 0 ? clearDuplicateOffers(combinedData) : null, 
        source: finalSource,
    };
    if (allErrors.length > 0) {
        response.errors = allErrors;
        response.combinedError = allErrors.join(' \n ');
    }

    console.log("Adapter: Final result for fetchOffersForAllDestinations:", {
        source: response.source,
        dataCount: response.data ? response.data.length : 0,
        errors: response.errors
    });

    return response;
};
