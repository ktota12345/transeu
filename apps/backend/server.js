// Główny plik serwera proxy Express
require('dotenv').config(); // Ładuje zmienne środowiskowe z pliku .env
const express = require('express');
const cors = require('cors');
const timocomProxyApi = require('./timocomProxyApi'); // Zaimportujemy logikę TIMOCOM
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
    if (!jsonData.timocomSettings) jsonData.timocomSettings = {}; // Dodano inicjalizację ustawień TIMOCOM
    return jsonData;
  } catch (error) {
    // Jeśli plik nie istnieje lub jest pusty/niepoprawny JSON, zwróć domyślną strukturę
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      console.warn(`Warning: ${dbPath} not found or invalid. Returning default structure.`);
      return { agents: [], logisticsBases: [], agentHistory: [], orders: [], timocomSettings: {} };
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
    const result = await timocomProxyApi.testExternalTimocomConnection();
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
    const result = await timocomProxyApi.fetchExternalTimocomOffers(searchParams);
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
//     const result = await timocomProxyApi.fetchExternalTimocomOfferDetails(offerId);
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
  console.log(`Backend: Received POST /api/agents/${agentId}/search-offers`, req.body);
  
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

    // 5. Pobierz miasto docelowe i promień poszukiwań z parametrów żądania lub z agenta
    const destinationCity = req.body.destinationCity || agent.destinationCity;
    if (!destinationCity) {
      return res.status(400).json({ success: false, error: `Agent (ID: ${agentId}) has no destination city selected.` });
    }
    
    // Pobierz promień poszukiwań z parametrów żądania lub z agenta (domyślnie 30 km)
    const searchRadius = req.body.searchRadius || agent.searchRadius || 30;
    console.log(`Backend: Using destination city: ${destinationCity.name} with search radius: ${searchRadius} km`);

    // Pobierz aktualną datę 
    const now = new Date();
    // Określ zakres czasowy dla wyszukiwania - ostatnie 24 godziny
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 godziny wstecz

    // 6. Skonstruuj parametry wyszukiwania dla Timocom API
    const searchParams = {
      // --- Parametry lokalizacji ---
      startLocation: {
        objectType: "areaSearch",
        area: { 
          address: {
            objectType: "address",
            city: startLogisticsBase.address.city,
            postalCode: startLogisticsBase.address.postalCode,
            country: startLogisticsBase.address.country
          },
          size_km: 50 // Stały promień dla lokalizacji startowej
        }
      },
      destinationLocation: {
        objectType: "areaSearch",
        area: {
          address: {
            objectType: "address",
            city: destinationCity.name,
            country: "DE",
            postalCode: destinationCity.postalCode || "",
            geoCoordinate: destinationCity.coordinates ? {
              latitude: destinationCity.coordinates.latitude,
              longitude: destinationCity.coordinates.longitude
            } : undefined
          },
          size_km: searchRadius
        }
      },
      // --- Parametry daty ---
      // Parametry czasowe dla wyszukiwania ofert z ostatnich 24 godzin
      exclusiveLeftLowerBoundDateTime: twentyFourHoursAgo.toISOString(), // Dolna granica (wyłączna) - 24 godziny temu
      inclusiveRightUpperBoundDateTime: now.toISOString(), // Górna granica (włączna) - teraz
      // --- Parametry dat załadunku ---
      loadingDate: {
        objectType: "individualDates",
        dates: [
          new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // jutro
          new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // pojutrze
          new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // za 3 dni
          new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // za 4 dni
          new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]  // za 5 dni
        ]
      },
      // --- Parametry paginacji ---
      firstResult: 0, // Zaczynamy od początku
      maxResults: 30, // Prosimy o max 30 wyników
    };

    // Dynamiczne ustawianie zakresu dat: dzisiaj + 5 dni
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 5);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Miesiące są 0-indeksowane
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    searchParams.earliestLoadingDate = formatDate(today);
    searchParams.latestLoadingDate = formatDate(futureDate);

    console.log(`Backend: Constructed Timocom search params for agent ${agentId}:`, JSON.stringify(searchParams, null, 2));

    // 7. Wywołaj API Timocom
    console.log("Backend: Calling Timocom API...");
    const timocomResponse = await timocomProxyApi.fetchExternalTimocomOffers(searchParams);
    console.log("Backend: Timocom API response received.");
    // Dodajmy log, aby zobaczyć strukturę odpowiedzi
    // console.log("Backend: Raw Timocom API response structure:", JSON.stringify(timocomResponse, null, 2)); 

    // Poprawione odczytywanie ofert - zakładamy strukturę z .data.payload
    const receivedOffers = timocomResponse?.data?.payload || []; 
    console.log(`Backend: Extracted ${receivedOffers.length} offers from Timocom response payload.`);

    // 8. Filtruj oferty (opcjonalnie, ale zalecane, by zapisywać tylko sensowne dane)
    const filteredOffers = receivedOffers.filter(offer =>
      offer.price && typeof offer.price.amount === 'number' &&
      typeof offer.distance_km === 'number' && offer.distance_km > 0
    );
    console.log(`Backend: Filtered down to ${filteredOffers.length} offers with price and distance.`);

    // 9. Zapisz przefiltrowane oferty do historii w db.json
    try {
      let historyEntryIndex = dbData.agentHistory.findIndex(entry => entry.agentId === agentId);
      
      if (historyEntryIndex !== -1) {
        // Aktualizuj istniejący wpis
        dbData.agentHistory[historyEntryIndex].offers = filteredOffers;
        dbData.agentHistory[historyEntryIndex].lastUpdated = new Date().toISOString();
        console.log(`Backend: Updated history for agent ${agentId}.`);
      } else {
        // Dodaj nowy wpis
        dbData.agentHistory.push({
          agentId: agentId,
          offers: filteredOffers,
          lastUpdated: new Date().toISOString()
        });
        console.log(`Backend: Created new history entry for agent ${agentId}.`);
      }
      
      await writeDb(dbData); // Zapisz zmiany w pliku db.json
      console.log("Backend: Successfully wrote updated history to db.json");
    } catch (dbError) {
      console.error("Backend: Error saving agent history to db.json:", dbError);
      // Zdecydować, czy błąd zapisu powinien zatrzymać proces - na razie tylko logujemy
      // Można rozważyć zwrócenie błędu 500, ale wtedy frontend nie dostanie wyników
    }

    // 10. Zwróć przefiltrowane oferty do frontendu
    res.json({ success: true, offers: filteredOffers });

  } catch (error) {
    console.error(`Backend: Error in /api/agents/${agentId}/search-offers:`, error);
    const statusCode = error.response?.status || 500;
    const message = error.message || 'Internal Server Error during agent offer search';
    const details = error.response?.data;
    res.status(statusCode).json({ success: false, error: message, details: details });
  }
});

// --- NOWY ENDPOINT: Pobieranie ostatnich zapisanych ofert --- 
app.get('/api/agents/:id/latest-offers', async (req, res) => {
  const agentId = parseInt(req.params.id, 10);
  console.log(`Backend: Received GET /api/agents/${agentId}/latest-offers request`);

  if (isNaN(agentId)) {
    return res.status(400).json({ success: false, error: 'Invalid agent ID.' });
  }

  try {
    const dbData = await readDb();
    const historyEntry = dbData.agentHistory.find(entry => entry.agentId === agentId);

    if (historyEntry && historyEntry.offers) {
      console.log(`Backend: Found ${historyEntry.offers.length} saved offers for agent ${agentId}.`);
      res.json({ success: true, offers: historyEntry.offers });
    } else {
      console.log(`Backend: No saved offers found for agent ${agentId}.`);
      res.json({ success: true, offers: [] }); // Zwróć pustą tablicę, jeśli brak historii
    }
  } catch (error) {
    console.error(`Backend: Error in /api/agents/${agentId}/latest-offers:`, error);
    res.status(500).json({ success: false, error: 'Internal Server Error fetching latest offers.' });
  }
});

// Endpoint do czyszczenia historii dla agenta
app.delete('/api/agents/:id/history', async (req, res) => {
  const agentId = parseInt(req.params.id, 10);
  console.log(`Backend: Received DELETE /api/agents/${agentId}/history request`);

  if (isNaN(agentId)) {
    return res.status(400).json({ success: false, error: 'Invalid agent ID.' });
  }

  try {
    // 1. Odczytaj bazę danych
    const dbData = await readDb();

    // 2. Sprawdź, czy agent istnieje (opcjonalne, ale dobra praktyka)
    const agentExists = dbData.agents.some(a => a.id === agentId);
    if (!agentExists) {
      // Można zdecydować, czy zwracać błąd, czy po prostu nic nie robić
      console.warn(`Backend: Agent with ID ${agentId} not found while trying to clear history. Proceeding anyway.`);
    }

    // 3. Odfiltruj historię, zachowując tylko wpisy dla INNYCH agentów
    const originalHistoryCount = dbData.agentHistory.length;
    dbData.agentHistory = dbData.agentHistory.filter(entry => entry.agentId !== agentId);
    const removedCount = originalHistoryCount - dbData.agentHistory.length;

    // 4. Zapisz zmodyfikowaną bazę danych
    await writeDb(dbData);
    console.log(`Backend: Cleared ${removedCount} history entries for agent ID ${agentId}.`);

    // 5. Zwróć sukces
    res.json({ success: true, message: `Successfully cleared ${removedCount} history entries for agent ID ${agentId}.` });

  } catch (error) {
    console.error(`Backend: Error clearing history for agent ID ${agentId}:`, error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error occurred while clearing history.' });
  }
});

// Endpoint do pobierania OSTATNIEGO wyniku wyszukiwania dla agenta
app.get('/api/agents/:id/latest-search', async (req, res) => {
  const agentId = parseInt(req.params.id);
  console.log(`Backend: Received GET /api/agents/${agentId}/latest-search`);

  if (isNaN(agentId)) {
    return res.status(400).json({ success: false, error: 'Invalid agent ID.' });
  }

  try {
    const dbData = await readDb();
    // Sprawdźmy, czy agent w ogóle istnieje (dobra praktyka)
    const agentExists = dbData.agents.some(a => a.id === agentId);
    if (!agentExists) {
      console.log(`Backend: Agent with ID ${agentId} not found when fetching latest search.`);
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Filtruj CAŁĄ historię (dbData.agentHistory), aby znaleźć wpisy dla danego agenta
    const agentSpecificHistory = (dbData.agentHistory || [])
      .filter(entry => entry.agentId === agentId && entry.type === 'searchOffers') // Upewnijmy się, że to wynik wyszukiwania
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sortuj malejąco po dacie

    if (agentSpecificHistory.length > 0) {
        const latestSearch = agentSpecificHistory[0]; // Pierwszy element po sortowaniu jest najnowszy
        console.log(`Backend: Found latest search for agent ${agentId} from ${latestSearch.timestamp || 'N/A'}`);
        // Upewnijmy się, że zwracamy obiekt z polem 'offers'
        res.json({
          success: true,
          timestamp: latestSearch.timestamp,
          details: latestSearch.details,
          offers: latestSearch.offers || [] // Zwracamy oferty lub pustą tablicę, jeśli ich brakuje
        });
    } else {
        console.log(`Backend: No search history found for agent ${agentId} in dbData.agentHistory.`);
        res.json({ success: true, offers: [], message: 'No search history found' }); // Zwróć pustą listę ofert i success: true
    }

  } catch (error) {
    console.error(`Backend: Error fetching latest search for agent ${agentId}:`, error);
    res.status(500).json({ success: false, message: 'Error fetching agent data or search history' });
  }
});

// Endpoint do zapisywania stanu agenta (bez zmian)
app.post('/api/agents/:id/save', async (req, res) => {
  // Kod endpointu pozostaje bez zmian
});

// --- NOWY ENDPOINT: Wyszukiwanie sekwencji (oferta powrotna) ---
const sequenceApi = require('./sequenceApi'); // Importujemy nową logikę API

app.post('/api/sequences/find', async (req, res) => {
  console.log("Backend: Received POST /api/sequences/find with body:", req.body);
  const { initialOffer, homeBase } = req.body; // Oczekujemy oferty początkowej i danych bazy domowej

  if (!initialOffer || !homeBase) {
    return res.status(400).json({ success: false, message: 'Brak wymaganych danych: initialOffer lub homeBase.' });
  }
  // Podstawowa walidacja danych wejściowych
  if (!initialOffer.deliveryAddress?.city || !initialOffer.deliveryAddress?.country || 
      !homeBase.address?.city || !homeBase.address?.country) {
     return res.status(400).json({ success: false, message: 'Niekompletne dane adresowe w initialOffer lub homeBase.' });
  }
  if (!initialOffer.loadingDate?.latest) {
      return res.status(400).json({ success: false, message: 'Brak daty rozładunku (latest loadingDate) w ofercie początkowej.' });
  }

  try {
    // 1. Przygotuj parametry wyszukiwania dla oferty powrotnej
    //    Start: Cel oferty początkowej
    //    Cel: Baza domowa
    //    Daty: Po dacie rozładunku oferty początkowej
    const returnSearchParams = {
      originCity: { // Miejsce startu oferty powrotnej = cel oferty początkowej
        name: initialOffer.deliveryAddress.city,
        country: initialOffer.deliveryAddress.country,
        postalCode: initialOffer.deliveryAddress.postalCode, // Może być null/undefined
      },
      destinationCity: { // Miejsce docelowe oferty powrotnej = baza domowa
        name: homeBase.address.city,
        country: homeBase.address.country,
        postalCode: homeBase.address.postalCode, 
      },
      searchRadius: 30, // Promień wokół miejsca startu oferty powrotnej (można dostosować)
      // Daty zostaną ustawione dynamicznie poniżej
      earliestLoadingDate: null, // Usuniemy te pola, bo sequenceApi oczekuje nazw z DateTime
      latestLoadingDate: null,
    };

    // --- NOWA LOGIKA USTALANIA DAT --- 
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Format ISO 8601 wymagany przez sequenceApi.js
        const lowerBound = twentyFourHoursAgo.toISOString();
        const upperBound = now.toISOString(); 

        // Przypisz do obiektu parametrów pod właściwymi nazwami
        returnSearchParams.exclusiveLeftLowerBoundDateTime = lowerBound;
        returnSearchParams.inclusiveRightUpperBoundDateTime = upperBound;

        console.log(`Sequence Search: Dates set dynamically from ${lowerBound} (24h ago) to ${upperBound} (now)`);

    } catch (dateError) {
        console.error("Sequence Search Error: Could not calculate dynamic dates:", dateError);
        return res.status(500).json({ success: false, message: 'Błąd podczas obliczania dynamicznych dat dla wyszukiwania sekwencji.' });
    }
    // --- KONIEC NOWEJ LOGIKI USTALANIA DAT ---

    // Usuwamy stare pola, jeśli jeszcze istnieją (na wszelki wypadek)
    delete returnSearchParams.earliestLoadingDate;
    delete returnSearchParams.latestLoadingDate;

    // 2. Wywołaj funkcję z sequenceApi do wyszukania ofert powrotnych
    console.log("Attempting to fetch return offers with params:", JSON.stringify(returnSearchParams, null, 2));
    const returnOffersData = await sequenceApi.fetchSequenceReturnOffers(returnSearchParams, timocomProxyApi.timocomApiClient);

    console.log("Received return offers data from sequenceApi:", returnOffersData); // Dodaj logowanie wyniku

    // 3. Przetwórz i zwróć wyniki
    // (Zakładając, że returnOffersData zawiera pole 'payload' z listą ofert)
    res.json({ success: true, offers: returnOffersData?.payload || [] });

  } catch (error) {
    console.error('Backend: Error during sequence finding:', error.message);
    // Zwróć bardziej szczegółowy błąd, jeśli pochodzi z Timocom API (przez sequenceApi)
    if (error.response?.data) {
        console.error('Backend: Timocom API Error details (sequence finding):', JSON.stringify(error.response.data, null, 2));
        return res.status(error.response.status || 500).json({ 
            success: false, 
            message: 'Błąd podczas komunikacji z API Timocom (wyszukiwanie sekwencji).',
            details: error.response.data 
        });
    } 
    // Inny błąd (np. przetwarzania dat, brak parametrów)
    res.status(500).json({ success: false, message: 'Wewnętrzny błąd serwera podczas wyszukiwania sekwencji.' });
  }
});

// --- API dla baz logistycznych ---

// Pobieranie wszystkich baz logistycznych
app.get('/api/logisticsBases', async (req, res) => {
  console.log('Backend: Received GET /api/logisticsBases request');
  try {
    const dbData = await readDb();
    res.json(dbData.logisticsBases || []);
  } catch (error) {
    console.error('Backend: Error fetching logistics bases:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch logistics bases' });
  }
});

// Pobieranie pojedynczej bazy logistycznej
app.get('/api/logisticsBases/:id', async (req, res) => {
  const baseId = parseInt(req.params.id, 10);
  console.log(`Backend: Received GET /api/logisticsBases/${baseId} request`);
  
  if (isNaN(baseId)) {
    return res.status(400).json({ success: false, error: 'Invalid logistics base ID' });
  }
  
  try {
    const dbData = await readDb();
    const base = dbData.logisticsBases.find(b => b.id === baseId);
    
    if (!base) {
      return res.status(404).json({ success: false, error: `Logistics base with ID ${baseId} not found` });
    }
    
    res.json(base);
  } catch (error) {
    console.error(`Backend: Error fetching logistics base ${baseId}:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch logistics base' });
  }
});

// Dodawanie nowej bazy logistycznej
app.post('/api/logisticsBases', async (req, res) => {
  console.log('Backend: Received POST /api/logisticsBases request with body:', req.body);
  
  if (!req.body.name || !req.body.address || !req.body.coordinates) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields (name, address, coordinates)' 
    });
  }
  
  try {
    const dbData = await readDb();
    
    // Generuj nowe ID (znajdź najwyższe istniejące ID i dodaj 1)
    const newId = dbData.logisticsBases.length > 0
      ? Math.max(...dbData.logisticsBases.map(b => b.id)) + 1
      : 1;
    
    const newBase = {
      id: newId,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    dbData.logisticsBases.push(newBase);
    await writeDb(dbData);
    
    res.status(201).json(newBase);
  } catch (error) {
    console.error('Backend: Error adding logistics base:', error);
    res.status(500).json({ success: false, error: 'Failed to add logistics base' });
  }
});

// Aktualizacja istniejącej bazy logistycznej
app.put('/api/logisticsBases/:id', async (req, res) => {
  const baseId = parseInt(req.params.id, 10);
  console.log(`Backend: Received PUT /api/logisticsBases/${baseId} request with body:`, req.body);
  
  if (isNaN(baseId)) {
    return res.status(400).json({ success: false, error: 'Invalid logistics base ID' });
  }
  
  if (!req.body.name || !req.body.address || !req.body.coordinates) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields (name, address, coordinates)' 
    });
  }
  
  try {
    const dbData = await readDb();
    const baseIndex = dbData.logisticsBases.findIndex(b => b.id === baseId);
    
    if (baseIndex === -1) {
      return res.status(404).json({ success: false, error: `Logistics base with ID ${baseId} not found` });
    }
    
    // Aktualizuj bazę, zachowując oryginalne ID i datę utworzenia
    const updatedBase = {
      ...dbData.logisticsBases[baseIndex],
      ...req.body,
      id: baseId, // Upewnij się, że ID się nie zmieni
      updatedAt: new Date().toISOString()
    };
    
    dbData.logisticsBases[baseIndex] = updatedBase;
    await writeDb(dbData);
    
    res.json(updatedBase);
  } catch (error) {
    console.error(`Backend: Error updating logistics base ${baseId}:`, error);
    res.status(500).json({ success: false, error: 'Failed to update logistics base' });
  }
});

// Usuwanie bazy logistycznej
app.delete('/api/logisticsBases/:id', async (req, res) => {
  const baseId = parseInt(req.params.id, 10);
  console.log(`Backend: Received DELETE /api/logisticsBases/${baseId} request`);
  
  if (isNaN(baseId)) {
    return res.status(400).json({ success: false, error: 'Invalid logistics base ID' });
  }
  
  try {
    const dbData = await readDb();
    const baseIndex = dbData.logisticsBases.findIndex(b => b.id === baseId);
    
    if (baseIndex === -1) {
      return res.status(404).json({ success: false, error: `Logistics base with ID ${baseId} not found` });
    }
    
    // Usuń bazę z tablicy
    const deletedBase = dbData.logisticsBases[baseIndex];
    dbData.logisticsBases.splice(baseIndex, 1);
    await writeDb(dbData);
    
    res.json({ success: true, deletedBase });
  } catch (error) {
    console.error(`Backend: Error deleting logistics base ${baseId}:`, error);
    res.status(500).json({ success: false, error: 'Failed to delete logistics base' });
  }
});

// --- API dla ustawień TIMOCOM ---

// Pobieranie ustawień TIMOCOM
app.get('/api/timocomSettings', async (req, res) => {
  console.log('Backend: Received GET /api/timocomSettings request');
  try {
    const dbData = await readDb();
    // Zwróć obiekt timocomSettings lub pusty obiekt, jeśli nie istnieje
    const settings = dbData.timocomSettings || {}; 
    console.log('Backend: Returning timocomSettings:', settings);
    res.json(settings);
  } catch (error) {
    console.error('Backend: Error fetching timocom settings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch timocom settings' });
  }
});

// Aktualizacja ustawień TIMOCOM (używamy PUT, bo to pojedynczy zasób)
app.put('/api/timocomSettings', async (req, res) => {
  console.log('Backend: Received PUT /api/timocomSettings request with body:', req.body);
  
  try {
    const dbData = await readDb();
    // Aktualizuj lub utwórz obiekt timocomSettings
    // Dodajemy lastUpdated po stronie backendu dla pewności
    dbData.timocomSettings = { 
      ...req.body, 
      lastUpdated: new Date().toISOString() 
    };
    
    await writeDb(dbData);
    console.log('Backend: Successfully updated timocomSettings:', dbData.timocomSettings);
    res.json(dbData.timocomSettings);
  } catch (error) {
    console.error('Backend: Error updating timocom settings:', error);
    res.status(500).json({ success: false, error: 'Failed to update timocom settings' });
  }
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Backend proxy server listening on port ${PORT}`);
});
