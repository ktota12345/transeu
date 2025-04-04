// Główny plik serwera proxy Express
require('dotenv').config(); // Ładuje zmienne środowiskowe z pliku .env
const express = require('express');
const cors = require('cors');
const timocomApi = require('./timocomProxyApi'); // Zaimportujemy logikę TIMOCOM
const fs = require('fs').promises; // Dodano moduł fs.promises
const path = require('path'); // Dodano moduł path

const app = express();
const PORT = process.env.PORT || 5000;

// Ścieżka do pliku db.json (zakładając, że jest w głównym folderze projektu)
const dbPath = path.join(__dirname, '..', 'db.json');

// --- Funkcje pomocnicze do obsługi db.json ---
async function readDb() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    const jsonData = JSON.parse(data);
    // Inicjalizacja brakujących kluczowych kolekcji, jeśli ich nie ma
    if (!jsonData.agents) jsonData.agents = [];
    if (!jsonData.logisticsBases) jsonData.logisticsBases = [];
    if (!jsonData.agentHistory) jsonData.agentHistory = []; // Dodano inicjalizację historii
    if (!jsonData.orders) jsonData.orders = [];
    return jsonData;
  } catch (error) {
    // Jeśli plik nie istnieje lub jest pusty/niepoprawny JSON, zwróć domyślną strukturę
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      console.warn(`Warning: ${dbPath} not found or invalid. Returning default structure.`);
      return { agents: [], logisticsBases: [], agentHistory: [], orders: [] };
    }
    console.error('Error reading db.json:', error);
    throw new Error('Could not read database file.'); // Rzuć błąd dalej
  }
}

async function writeDb(data) {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to db.json:', error);
    throw new Error('Could not write to database file.'); // Rzuć błąd dalej
  }
}

// Middleware
app.use(cors()); // Zezwól na żądania z frontendu (localhost:4000)
app.use(express.json()); // Pozwól na parsowanie JSON w ciele żądania

// --- Endpointy Proxy (istniejące) --- 

// Endpoint do testowania połączenia
app.post('/test-connection', async (req, res) => {
  console.log('Backend: Received /test-connection request');
  try {
    const result = await timocomApi.testExternalTimocomConnection();
    console.log('Backend: Sending /test-connection response:', result);
    res.json(result);
  } catch (error) {
    console.error('Backend: Error in /test-connection:', error);
    // Zwracamy bardziej szczegółowy błąd, jeśli dostępny
    const statusCode = error.response?.status || 500;
    const message = error.message || 'Internal Server Error during test connection';
    const details = error.response?.data;
    res.status(statusCode).json({ success: false, error: message, details: details });
  }
});

// Endpoint do wyszukiwania ofert
app.post('/search-offers', async (req, res) => {
  console.log('Backend: Received /search-offers request with body:', req.body);
  try {
    const { searchParams } = req.body; // Oczekujemy parametrów wyszukiwania w ciele żądania
    if (!searchParams) {
      return res.status(400).json({ success: false, error: 'Missing searchParams in request body' });
    }
    const result = await timocomApi.fetchExternalTimocomOffers(searchParams);
    console.log('Backend: Sending /search-offers response:', result);
    res.json(result);
  } catch (error) {
    console.error('Backend: Error in /search-offers:', error);
    const statusCode = error.response?.status || 500;
    const message = error.message || 'Internal Server Error during offer search';
    const details = error.response?.data;
    res.status(statusCode).json({ success: false, error: message, details: details });
  }
});

// Endpoint do pobierania szczegółów oferty (przykład, wymaga dostosowania)
// app.get('/offer-details/:offerId', async (req, res) => {
//   console.log(`Backend: Received /offer-details/${req.params.offerId} request`);
//   try {
//     const { offerId } = req.params;
//     const result = await timocomApi.fetchExternalTimocomOfferDetails(offerId);
//     console.log('Backend: Sending /offer-details response:', result);
//     res.json(result);
//   } catch (error) {
//     console.error('Backend: Error in /offer-details:', error);
//     const statusCode = error.response?.status || 500;
//     const message = error.message || 'Internal Server Error fetching offer details';
//     const details = error.response?.data;
//     res.status(statusCode).json({ success: false, error: message, details: details });
//   }
// });

// --- Endpointy API aplikacji (nowe i przyszłe) --- 

// Endpoint do wyszukiwania ofert dla agenta i zapisywania historii
app.post('/api/agents/:id/search-offers', async (req, res) => {
  const agentId = parseInt(req.params.id, 10); // Pobierz ID agenta z URL
  console.log(`Backend: Received POST /api/agents/${agentId}/search-offers`);
  
  if (isNaN(agentId)) {
    return res.status(400).json({ success: false, error: 'Invalid agent ID.' });
  }

  try {
    // 1. Odczytaj bazę danych
    const dbData = await readDb();

    // 2. Znajdź agenta
    const agent = dbData.agents.find(a => a.id === agentId);
    if (!agent) {
      return res.status(404).json({ success: false, error: `Agent with ID ${agentId} not found.` });
    }

    // 3. Pobierz ID bazy startowej z agenta
    const startBaseId = agent.selectedLogisticsBase; // Używamy poprawnej nazwy pola z db.json
    if (!startBaseId) {
      return res.status(400).json({ success: false, error: `Agent (ID: ${agentId}) is missing selected logistics base ID.` });
    }

    // 4. Znajdź obiekt bazy logistycznej startowej
    const startLogisticsBase = dbData.logisticsBases.find(b => b.id === startBaseId);
    if (!startLogisticsBase) {
        return res.status(404).json({ success: false, error: `Start logistics base (ID: ${startBaseId}) for agent ID ${agentId} not found.` });
    }
    // Sprawdzenie adresu bazy startowej
    if (!startLogisticsBase.address || !startLogisticsBase.address.city || !startLogisticsBase.address.postalCode || !startLogisticsBase.address.country) {
      return res.status(400).json({ success: false, error: `Start logistics base (ID: ${startBaseId}) is missing required address details (city, postalCode, country).` });
    }

    // 5. Pobierz listę miast docelowych z agenta
    const destinationCities = agent.selectedGermanDestinations; // Zakładamy, że to pole istnieje i jest tablicą
    if (!Array.isArray(destinationCities) || destinationCities.length === 0) {
      return res.status(400).json({ success: false, error: `Agent (ID: ${agentId}) has no selected German destination cities.` });
    }
    // Wybieramy pierwsze miasto z listy jako cel
    const targetDestinationCity = destinationCities[0];

    // Pobierz aktualną datę 
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000); // Chwila wcześniej dla dolnej granicy exclusiveLeftLowerBoundDateTime

    // 6. Skonstruuj parametry wyszukiwania dla Timocom API (ZGODNIE Z DOKUMENTACJĄ loadingDate)
    const searchParams = {
      // --- Parametry lokalizacji (powrót do logicznej struktury) ---
      startLocation: {
        objectType: "areaSearch", // Typ na górnym poziomie
        area: { 
          address: {
            objectType: "address",
            city: startLogisticsBase.address.city,
            postalCode: startLogisticsBase.address.postalCode,
            country: startLogisticsBase.address.country
          },
          size_km: agent.timocomSettings?.startSearchRadius || 50
        }
      },
      destinationLocation: {
        objectType: "areaSearch", // Typ na górnym poziomie
        area: {
          address: {
            objectType: "address",
            city: targetDestinationCity, 
            country: "DE"
          },
          size_km: agent.timocomSettings?.destinationSearchRadius || 50
        }
      },
      // --- Parametry daty (ZGODNIE Z DOKUMENTACJĄ loadingDate) ---
      exclusiveLeftLowerBoundDateTime: oneMinuteAgo.toISOString(), // Dolna granica
      inclusiveRightUpperBoundDateTime: now.toISOString(), // Górna granica
      loadingDate: { // Struktura wg dokumentacji dla "Individual Dates"
        objectType: "individualDates", // ZGADUJEMY NAZWĘ TYPU!
        dates: [
          "2025-04-07",
          "2025-04-08",
          "2025-04-09",
          "2025-04-10",
          "2025-04-11"
        ]
      },
      // --- Parametry paginacji ---
      firstResult: 0, // Zaczynamy od początku
      maxResults: 30, // Prosimy o max 30 wyników
      // --- Dodatkowe parametry z konfiguracji agenta ---
      ...(agent.timocomSettings?.additionalParams || {}),
    };
    console.log(`Backend: Constructed Timocom search params for agent ${agentId}:`, JSON.stringify(searchParams, null, 2));

    // 7. Wywołaj funkcję wyszukującą oferty
    const timocomApiResponse = await timocomApi.fetchExternalTimocomOffers(searchParams); // Zmieniono nazwę zmiennej dla jasności

    // DODATKOWE LOGOWANIE STRUKTURY ODPOWIEDZI
    console.log('Backend: Raw timocomApiResponse structure:', JSON.stringify(timocomApiResponse, null, 2));

    // 8. Przetwórz odpowiedź, stwórz wpis historii, zapisz i odpowiedz
    if (timocomApiResponse.success && timocomApiResponse.data && Array.isArray(timocomApiResponse.data.payload)) {
      // Odpowiedź udana, przetwarzamy payload
      const offersFound = timocomApiResponse.data.payload;
      const offersCount = offersFound.length; 
      console.log(`Backend: Agent ${agentId} - Found ${offersCount} offers from Timocom.`);

      const agentHistoryEntry = {
        id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        agentId: agentId,
        timestamp: new Date().toISOString(),
        type: 'searchOffers',
        status: 'success',
        details: `Found ${offersCount} offers.`,
        offers: offersFound, // Zapisujemy poprawnie tablicę ofert z payload
        errorDetails: null
      };

      // Zapisz wpis do historii
      if (!Array.isArray(dbData.agentHistory)) { dbData.agentHistory = []; }
      dbData.agentHistory.push(agentHistoryEntry);
      await writeDb(dbData);
      console.log(`Backend: Saved successful search results to agent ${agentId} history.`);

      // Zwróć sukces do frontendu (Z TEGO BLOKU)
      res.json({ success: true, message: agentHistoryEntry.details, offersCount: offersCount, offers: agentHistoryEntry.offers });
    } else {
      // Odpowiedź nieudana lub nieoczekiwana struktura
      const offersCount = 0; 
      const errorMessage = timocomApiResponse.error || 'Unknown error or unexpected response structure from Timocom API.';
      console.error(`Backend: Failed to fetch or process offers from Timocom for agent ${agentId}. Error: ${errorMessage}`, timocomApiResponse.details || '');

      const agentHistoryEntry = {
        id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        agentId: agentId,
        timestamp: new Date().toISOString(),
        type: 'searchOffers',
        status: 'error',
        details: `Failed to fetch offers from Timocom: ${errorMessage}`,
        offers: [],
        errorDetails: timocomApiResponse.details || null // Zapisz szczegóły błędu, jeśli dostępne
      };

      // Zapisz wpis do historii
      if (!Array.isArray(dbData.agentHistory)) { dbData.agentHistory = []; }
      dbData.agentHistory.push(agentHistoryEntry);
      await writeDb(dbData);
      console.log(`Backend: Saved failed search attempt to agent ${agentId} history.`);

      // Zwróć błąd do frontendu (Z TEGO BLOKU)
      res.json({ success: false, message: agentHistoryEntry.details, offersCount: offersCount, offers: agentHistoryEntry.offers });
    }
  } catch (error) {
    // Błąd wewnętrzny serwera (np. odczyt/zapis pliku, błąd agenta/bazy)
    console.error(`Backend: Internal server error OR error saving history in /api/agents/${agentId}/search-offers:`, error);
    if (!res.headersSent) {
       res.status(500).json({ success: false, error: error.message || 'Internal server error occurred during history save or processing.' });
    }
  }
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Backend proxy server listening on port ${PORT}`);
});
