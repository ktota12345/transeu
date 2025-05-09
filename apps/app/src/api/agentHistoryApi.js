/**
 * API dla historii działania agenta
 * Zarządza zapisywaniem i pobieraniem historii wyszukiwań oraz oceny rentowności ofert
 */

import axios from 'axios';

// W rzeczywistej aplikacji te dane byłyby przechowywane w bazie danych
// Na potrzeby demonstracji używamy API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/' 
  : 'http://localhost:4002'; // Bez /api dla agentHistory

/**
 * Dodaje nowy wpis do historii agenta
 * @param {string} agentId - ID agenta
 * @param {Object} historyEntry - Wpis historii zawierający informacje o wyszukiwaniu i ocenie
 * @returns {Object} - Dodany wpis historii z unikalnym ID
 */
export const addAgentHistoryEntry = async (agentId, historyEntry) => {
  // W tej wersji demonstracyjnej nie dodajemy nowych wpisów
  // Zamiast tego używamy gotowych danych z API
  
  // Generujemy unikalny ID dla wpisu
  const entryId = Date.now().toString();
  
  // Dodajemy metadane
  const newEntry = {
    id: entryId,
    agentId,
    timestamp: new Date().toISOString(),
    ...historyEntry
  };
  
  return newEntry;
};

/**
 * Pobiera historię działania agenta
 * @param {string|number} agentId - ID agenta
 * @returns {Array} - Lista wpisów historii
 */
export const fetchAgentHistory = async (agentId) => {
  try {
    // Konwertujemy ID agenta na string, aby zapewnić kompatybilność
    const agentIdStr = String(agentId);
    
    console.log(`Pobieranie historii dla agenta ${agentIdStr}...`);
    
    // Używamy axios z timeoutem
    const response = await axios.get(`${API_BASE_URL}/agentHistory`, {
      params: { agentId: agentIdStr }, // Filtrujemy po stronie serwera, jeśli json-server to wspiera
      timeout: 5000
    });
    
    console.log('Odpowiedź API agentHistory:', response.data);
    
    // Sprawdzamy, czy dane są tablicą (co jest oczekiwane od json-server)
    if (Array.isArray(response.data)) {
      // Filtrujemy wpisy dla konkretnego agenta
      const filteredHistory = response.data.filter(entry => String(entry.agentId) === agentIdStr);
      console.log(`Historia dla agenta ${agentIdStr}:`, filteredHistory);
      return filteredHistory;
    } else if (response.data && typeof response.data === 'object') {
      // Obsługa dla przypadku, gdy API zwraca obiekt z kluczami będącymi ID agentów
      const history = response.data[agentIdStr] || [];
      console.log(`Historia dla agenta ${agentIdStr} (format obiektu):`, history);
      return history;
    } else {
      // Jeśli nie ma danych dla tego agenta, zwracamy pustą tablicę
      console.log(`Brak historii dla agenta ${agentIdStr}`);
      return [];
    }
  } catch (error) {
    // Obsługa różnych rodzajów błędów
    if (error.code === 'ECONNABORTED') {
      console.warn('Żądanie zostało przerwane z powodu przekroczenia limitu czasu');
    } else if (error.response) {
      // Serwer zwrócił odpowiedź z kodem błędu
      console.error(`Błąd ${error.response.status}: ${error.response.statusText}`);
    } else if (error.request) {
      // Żądanie zostało wysłane, ale nie otrzymano odpowiedzi
      console.error('Błąd sieci: Brak odpowiedzi od serwera');
    } else {
      // Coś poszło nie tak podczas konfigurowania żądania
      console.error('Błąd podczas pobierania historii agenta:', error.message);
    }
    // Zawsze zwracamy pustą tablicę w przypadku błędu, aby uniknąć problemów z renderowaniem
    return [];
  }
};

/**
 * Pobiera konkretny wpis z historii agenta
 * @param {string} entryId - ID wpisu
 * @returns {Object|null} - Wpis historii lub null, jeśli nie znaleziono
 */
export const fetchAgentHistoryEntry = async (entryId) => {
  try {
    // Dodajemy timeout, aby uniknąć zawieszenia aplikacji przy problemach z siecią
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Najpierw pobieramy całą historię wszystkich agentów
    const response = await fetch(`${API_BASE_URL}/agents/1/history`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Błąd ${response.status}: Nie udało się pobrać historii agenta`);
    }
    
    const data = await response.json();
    
    // Szukamy wpisu o podanym ID
    const entry = data.find(entry => entry.id === entryId);
    return entry || null;
  } catch (error) {
    // Obsługa różnych rodzajów błędów
    if (error.name === 'AbortError') {
      console.warn('Żądanie zostało przerwane z powodu przekroczenia limitu czasu');
    } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('Błąd sieci: Sprawdź połączenie lub dostępność API');
    } else {
      console.error('Błąd podczas pobierania wpisu historii:', error);
    }
    return null;
  }
};

/**
 * Czyści historię działania agenta
 * @param {string} agentId - ID agenta
 * @returns {Object} - Informacja o powodzeniu operacji
 */
export const clearAgentHistory = async (agentId) => {
  try {
    // Dodajemy timeout, aby uniknąć zawieszenia aplikacji przy problemach z siecią
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/agents/${agentId}/history/clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Błąd ${response.status}: Nie udało się wyczyścić historii agenta`);
    }
    
    return { success: true, message: `Historia dla agenta ${agentId} została wyczyszczona` };
  } catch (error) {
    // Obsługa różnych rodzajów błędów
    if (error.name === 'AbortError') {
      console.warn('Żądanie zostało przerwane z powodu przekroczenia limitu czasu');
      return { success: false, message: 'Przekroczono limit czasu operacji' };
    } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('Błąd sieci: Sprawdź połączenie lub dostępność API');
      return { success: false, message: 'Błąd sieci: Sprawdź połączenie lub dostępność API' };
    } else {
      console.error('Błąd podczas czyszczenia historii agenta:', error);
      return { success: false, message: error.message };
    }
  }
};

/**
 * Zapisuje historię wyszukiwania ofert przez agenta
 * @param {string} agentId - ID agenta
 * @param {Array} initialOffers - Lista ofert przed oceną rentowności
 * @param {Array} processedOffers - Lista ofert po ocenie rentowności
 * @param {Object} searchParams - Parametry wyszukiwania
 * @returns {Object} - Dodany wpis historii
 */
export const saveAgentSearchHistory = async (agentId, initialOffers, processedOffers, searchParams = {}) => {
  const historyEntry = {
    type: 'search',
    searchParams,
    initialOffers: initialOffers || [],
    processedOffers: processedOffers || [],
    offersCount: initialOffers?.length || 0,
    acceptedOffersCount: processedOffers?.filter(offer => offer.profitability && offer.profitability.score >= 70).length || 0
  };
  
  return await addAgentHistoryEntry(agentId, historyEntry);
};

/**
 * Zapisuje historię akcji podjętej dla oferty
 * @param {string} agentId - ID agenta
 * @param {Object} offer - Oferta
 * @param {string} action - Podjęta akcja (accept, reject, negotiate)
 * @param {Object} actionDetails - Szczegóły akcji
 * @returns {Object} - Dodany wpis historii
 */
export const saveAgentOfferAction = async (agentId, offer, action, actionDetails = {}) => {
  const historyEntry = {
    type: 'action',
    offer,
    action,
    actionDetails
  };
  
  return await addAgentHistoryEntry(agentId, historyEntry);
};
