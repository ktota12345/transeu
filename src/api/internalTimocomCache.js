import axios from 'axios';

// --- Konfiguracja Wewnętrznego API (Cache Ofert TIMOCOM) ---
const INTERNAL_API_URL = process.env.REACT_APP_INTERNAL_API_URL || 'http://localhost:4002';
const OFFERS_ENDPOINT = '/timocom-offers'; // Endpoint dla cache'owanych ofert Timocom

// Klient Axios dla wewnętrznego API
const internalApiClient = axios.create({
  baseURL: INTERNAL_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // Krótszy timeout dla lokalnego serwera
});

/**
 * Pobiera wszystkie cache'owane oferty TIMOCOM z wewnętrznej bazy danych.
 * @returns {Promise<Array>} - Lista ofert z cache.
 * @throws {Error} - Jeśli wystąpi błąd podczas pobierania.
 */
export const fetchCachedTimocomOffers = async () => {
  try {
    console.log('Pobieranie ofert TIMOCOM z wewnętrznego cache...');
    const response = await internalApiClient.get(OFFERS_ENDPOINT);
    return response.data || [];
  } catch (error) {
    console.error('Błąd podczas pobierania ofert TIMOCOM z wewnętrznego cache:', error);
    // Można zdecydować, czy rzucać błąd dalej, czy zwrócić pustą tablicę
    // Rzucenie błędu pozwoli na jego obsługę w adapterze
    throw error;
  }
};

/**
 * Zapisuje nowe oferty TIMOCOM do wewnętrznego cache, unikając duplikatów.
 * @param {Array<Object>} newOffers - Tablica nowych ofert do zapisania (w formacie TIMOCOM).
 * @returns {Promise<{ savedCount: number, skippedCount: number }>} - Wynik operacji zapisu.
 * @throws {Error} - Jeśli wystąpi błąd podczas zapisu.
 */
export const saveTimocomOffersToCache = async (newOffers) => {
  if (!Array.isArray(newOffers) || newOffers.length === 0) {
    return { savedCount: 0, skippedCount: 0 };
  }

  let savedCount = 0;
  let skippedCount = 0;

  try {
    // 1. Pobierz ID istniejących ofert, aby uniknąć duplikatów
    // Optymalizacja: Można by pobrać tylko pole 'id', jeśli API na to pozwala.
    // JSON Server domyślnie tego nie wspiera, więc pobieramy całe obiekty.
    const existingOffersResponse = await internalApiClient.get(OFFERS_ENDPOINT);
    const existingOfferIds = new Set((existingOffersResponse.data || []).map(offer => offer.id));

    console.log(`Znaleziono ${existingOfferIds.size} ofert w cache.`);

    // 2. Przefiltruj nowe oferty, aby zapisać tylko te, których jeszcze nie ma
    const offersToSave = newOffers.filter(offer => !existingOfferIds.has(offer.id));
    skippedCount = newOffers.length - offersToSave.length;

    if (offersToSave.length === 0) {
      console.log('Brak nowych ofert TIMOCOM do zapisania w cache.');
      return { savedCount: 0, skippedCount: skippedCount };
    }

    console.log(`Próba zapisania ${offersToSave.length} nowych ofert TIMOCOM do cache...`);

    // 3. Zapisz nowe oferty (pojedynczo, bo JSON Server nie wspiera łatwo batch insert)
    // TODO: Rozważyć alternatywne strategie zapisu, jeśli wydajność jest problemem
    //       (np. biblioteka json-server-batch dla operacji wsadowych).
    for (const offer of offersToSave) {
      try {
         // Dodaj standardowe pola, jeśli ich brakuje (np. objectType)
         const offerData = {
             ...offer,
             objectType: offer.objectType || 'freightOffer',
             // Upewnij się, że data utworzenia jest obecna
             creationDateTime: offer.creationDateTime || new Date().toISOString(),
             // Dodaj znacznik czasu zapisu do cache'u
             cachedAt: new Date().toISOString()
         };
        await internalApiClient.post(OFFERS_ENDPOINT, offerData);
        savedCount++;
      } catch (postError) {
        console.error(`Błąd podczas zapisywania oferty ${offer.id} do cache:`, postError);
        // Kontynuuj z następną ofertą
      }
    }

    console.log(`Zapisano ${savedCount} z ${offersToSave.length} nowych ofert TIMOCOM w cache.`);
    return { savedCount, skippedCount };

  } catch (error) {
    console.error('Błąd podczas zapisywania ofert TIMOCOM do wewnętrznego cache:', error);
    throw error; // Rzuć błąd, aby obsłużyć go w adapterze
  }
};

/**
 * (Opcjonalnie) Funkcja do czyszczenia cache ofert TIMOCOM.
 * @returns {Promise<void>}
 */
export const clearTimocomCache = async () => {
  try {
    console.warn('Czyszczenie całego cache ofert TIMOCOM...');
    // Niestety, JSON Server nie ma prostego endpointu do usuwania wszystkiego.
    // Trzeba pobrać wszystkie ID i usunąć je pojedynczo.
    const offers = await fetchCachedTimocomOffers();
    for (const offer of offers) {
      await internalApiClient.delete(`${OFFERS_ENDPOINT}/${offer.id}`);
    }
    console.log('Cache ofert TIMOCOM wyczyszczony.');
  } catch (error) {
    console.error('Błąd podczas czyszczenia cache ofert TIMOCOM:', error);
    throw error;
  }
};
