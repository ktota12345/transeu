const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); 
const app = express();
const PORT = process.env.PORT || 3002;

// Dane z db.json
const dbPath = path.join(__dirname, 'db.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Inicjalizacja kolekcji baz logistycznych, jeśli nie istnieje
if (!db.logisticsBases) {
  db.logisticsBases = [];
}

// Funkcja do zapisywania zmian w db.json
const saveDb = () => {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
};

// Inicjalizacja tablicy baz logistycznych, jeśli nie istnieje
if (!db.logisticsBases) {
  db.logisticsBases = [];
  saveDb();
  console.log('Zainicjalizowano pustą tablicę baz logistycznych');
}

// Dodanie przykładowej historii agenta
if (!db.agentHistory) {
  db.agentHistory = {
    "1": [
      {
        "id": "entry_1",
        "agentId": 1,
        "timestamp": "2025-03-27T10:15:00.000Z",
        "type": "search",
        "searchParams": {
          "agentConfig": {
            "name": "Agent Transportowy Premium",
            "selectedLogisticsBase": "WRO1"
          }
        },
        "initialOffers": [
          {
            "id": "offer_1",
            "loadingPlace": {
              "address": {
                "city": "Warszawa"
              }
            },
            "unloadingPlace": {
              "address": {
                "city": "Berlin"
              }
            },
            "price": {
              "amount": 1200,
              "currency": "EUR"
            },
            "distance": {
              "value": 520
            }
          },
          {
            "id": "offer_2",
            "loadingPlace": {
              "address": {
                "city": "Poznań"
              }
            },
            "unloadingPlace": {
              "address": {
                "city": "Hamburg"
              }
            },
            "price": {
              "amount": 1350,
              "currency": "EUR"
            },
            "distance": {
              "value": 650
            }
          },
          {
            "id": "offer_3",
            "loadingPlace": {
              "address": {
                "city": "Wrocław"
              }
            },
            "unloadingPlace": {
              "address": {
                "city": "Praga"
              }
            },
            "price": {
              "amount": 850,
              "currency": "EUR"
            },
            "distance": {
              "value": 280
            }
          }
        ],
        "processedOffers": [
          {
            "id": "offer_1",
            "loadingPlace": {
              "address": {
                "city": "Warszawa"
              }
            },
            "unloadingPlace": {
              "address": {
                "city": "Berlin"
              }
            },
            "price": {
              "amount": 1200,
              "currency": "EUR"
            },
            "distance": {
              "value": 520
            },
            "profitability": {
              "score": 75,
              "profit": 320.50,
              "revenue": 1200,
              "cost": 879.50
            }
          },
          {
            "id": "offer_2",
            "loadingPlace": {
              "address": {
                "city": "Poznań"
              }
            },
            "unloadingPlace": {
              "address": {
                "city": "Hamburg"
              }
            },
            "price": {
              "amount": 1350,
              "currency": "EUR"
            },
            "distance": {
              "value": 650
            },
            "profitability": {
              "score": 65,
              "profit": 280.75,
              "revenue": 1350,
              "cost": 1069.25
            }
          },
          {
            "id": "offer_3",
            "loadingPlace": {
              "address": {
                "city": "Wrocław"
              }
            },
            "unloadingPlace": {
              "address": {
                "city": "Praga"
              }
            },
            "price": {
              "amount": 850,
              "currency": "EUR"
            },
            "distance": {
              "value": 280
            },
            "profitability": {
              "score": 82,
              "profit": 310.20,
              "revenue": 850,
              "cost": 539.80
            }
          }
        ],
        "offersCount": 3,
        "acceptedOffersCount": 2
      },
      {
        "id": "entry_2",
        "agentId": 1,
        "timestamp": "2025-03-27T12:30:00.000Z",
        "type": "search",
        "searchParams": {
          "agentConfig": {
            "name": "Agent Transportowy Premium",
            "selectedLogisticsBase": "POZ1"
          }
        },
        "initialOffers": [
          {
            "id": "offer_4",
            "loadingPlace": {
              "address": {
                "city": "Gdańsk"
              }
            },
            "unloadingPlace": {
              "address": {
                "city": "Kopenhaga"
              }
            },
            "price": {
              "amount": 1800,
              "currency": "EUR"
            },
            "distance": {
              "value": 780
            }
          },
          {
            "id": "offer_5",
            "loadingPlace": {
              "address": {
                "city": "Szczecin"
              }
            },
            "unloadingPlace": {
              "address": {
                "city": "Malmö"
              }
            },
            "price": {
              "amount": 1250,
              "currency": "EUR"
            },
            "distance": {
              "value": 420
            }
          }
        ],
        "processedOffers": [
          {
            "id": "offer_4",
            "loadingPlace": {
              "address": {
                "city": "Gdańsk"
              }
            },
            "unloadingPlace": {
              "address": {
                "city": "Kopenhaga"
              }
            },
            "price": {
              "amount": 1800,
              "currency": "EUR"
            },
            "distance": {
              "value": 780
            },
            "profitability": {
              "score": 58,
              "profit": 290.50,
              "revenue": 1800,
              "cost": 1509.50
            }
          },
          {
            "id": "offer_5",
            "loadingPlace": {
              "address": {
                "city": "Szczecin"
              }
            },
            "unloadingPlace": {
              "address": {
                "city": "Malmö"
              }
            },
            "price": {
              "amount": 1250,
              "currency": "EUR"
            },
            "distance": {
              "value": 420
            },
            "profitability": {
              "score": 78,
              "profit": 420.30,
              "revenue": 1250,
              "cost": 829.70
            }
          }
        ],
        "offersCount": 2,
        "acceptedOffersCount": 1
      },
      {
        "id": "entry_3",
        "agentId": 1,
        "timestamp": "2025-03-27T13:45:00.000Z",
        "type": "action",
        "offer": {
          "id": "offer_1",
          "loadingPlace": {
            "address": {
              "city": "Warszawa"
            }
          },
          "unloadingPlace": {
            "address": {
              "city": "Berlin"
            }
          },
          "price": {
            "amount": 1200,
            "currency": "EUR"
          }
        },
        "action": "accept",
        "actionDetails": {
          "reason": "Wysoka rentowność, dobra cena za kilometr"
        }
      },
      {
        "id": "entry_4",
        "agentId": 1,
        "timestamp": "2025-03-27T13:50:00.000Z",
        "type": "action",
        "offer": {
          "id": "offer_2",
          "loadingPlace": {
            "address": {
              "city": "Poznań"
            }
          },
          "unloadingPlace": {
            "address": {
              "city": "Hamburg"
            }
          },
          "price": {
            "amount": 1350,
            "currency": "EUR"
          }
        },
        "action": "reject",
        "actionDetails": {
          "reason": "Niska rentowność, zbyt wysokie koszty"
        }
      }
    ]
  };
  
  // Zapisz zaktualizowaną bazę danych
  saveDb();
  console.log('Dodano przykładową historię agenta');
}

console.log('Załadowano bazę danych. Liczba zleceń:', db.orders.length);
console.log('Identyfikatory zleceń:', db.orders.map(o => o.id));

// Middleware do obsługi JSON
app.use(express.json());

// Statyczne pliki z katalogu build
app.use(express.static(path.join(__dirname, 'build')));

// Middleware do logowania zapytań
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Proxy dla API TIMOCOM - rozwiązuje problem CORS
app.all('/api/timocom-proxy/*', async (req, res) => {
  try {
    // Wyciągnij endpoint TIMOCOM z URL
    const timocomEndpoint = req.url.replace('/api/timocom-proxy', '');
    const timocomBaseUrl = 'https://sandbox.timocom.com';
    const url = `${timocomBaseUrl}${timocomEndpoint}`;
    
    // Pobierz dane uwierzytelniające z nagłówków
    const authHeader = req.headers.authorization;
    
    console.log(`Proxy request to TIMOCOM: ${req.method} ${url}`);
    console.log('Headers:', JSON.stringify(req.headers));
    
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      console.log('Request body:', JSON.stringify(req.body));
    }
    
    // Przygotuj konfigurację dla żądania proxy
    const config = {
      method: req.method,
      url: url,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // Zwiększamy timeout do 30 sekund
    };
    
    // Przekaż nagłówek autoryzacji, jeśli istnieje
    if (authHeader) {
      config.headers['Authorization'] = authHeader;
      console.log('Using Authorization header from request');
    }
    
    // Dodaj dane do żądania, jeśli to POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      config.data = req.body;
    }
    
    console.log('Sending request to TIMOCOM with config:', {
      method: config.method,
      url: config.url,
      headers: Object.keys(config.headers),
      dataSize: config.data ? JSON.stringify(config.data).length : 0
    });
    
    // Wykonaj żądanie proxy
    const response = await axios(config);
    
    console.log('TIMOCOM response received:', {
      status: response.status,
      statusText: response.statusText,
      dataSize: response.data ? JSON.stringify(response.data).length : 0
    });
    
    // Zwróć odpowiedź z serwera TIMOCOM
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Błąd proxy TIMOCOM:', error.message);
    
    if (error.config) {
      console.error('Request config:', {
        method: error.config.method,
        url: error.config.url,
        headers: error.config.headers ? Object.keys(error.config.headers) : [],
        data: error.config.data ? JSON.stringify(error.config.data).substring(0, 200) + '...' : null
      });
    }
    
    // Przygotuj odpowiednią odpowiedź błędu
    if (error.response) {
      // Serwer odpowiedział z błędem
      console.error('Response error data:', error.response.data);
      res.status(error.response.status).json({
        error: true,
        message: error.message,
        data: error.response.data
      });
    } else if (error.request) {
      // Żądanie zostało wysłane, ale nie otrzymano odpowiedzi
      console.error('Request error:', error.request);
      res.status(504).json({
        error: true,
        message: 'Nie otrzymano odpowiedzi z serwera TIMOCOM',
        details: error.message,
        code: error.code
      });
    } else {
      // Błąd podczas konfiguracji żądania
      res.status(500).json({
        error: true,
        message: 'Błąd konfiguracji żądania',
        details: error.message
      });
    }
  }
});

// API endpoints
app.get('/api/agents', (req, res) => {
  const { id, name, type } = req.query;
  
  let agents = [...db.agents];
  
  if (id) {
    agents = agents.filter(a => a.id === id);
  }
  
  if (name) {
    agents = agents.filter(a => a.name.toLowerCase().includes(name.toLowerCase()));
  }
  
  if (type) {
    agents = agents.filter(a => a.type === type);
  }
  
  console.log(`Znaleziono ${agents.length} agentów`);
  res.json(agents);
});

app.get('/api/agents/:id', (req, res) => {
  const agent = db.agents.find(a => a.id === parseInt(req.params.id));
  console.log(`Szukam agenta o ID ${req.params.id}, znaleziono:`, agent ? 'tak' : 'nie');
  if (agent) {
    res.json(agent);
  } else {
    res.status(404).json({ error: 'Agent not found' });
  }
});

app.post('/api/agents', (req, res) => {
  const newAgent = {
    ...req.body,
    id: db.agents.length > 0 ? Math.max(...db.agents.map(a => a.id)) + 1 : 1
  };
  
  db.agents.push(newAgent);
  saveDb();
  console.log(`Dodano nowego agenta o ID ${newAgent.id}`);
  res.status(201).json(newAgent);
});

app.put('/api/agents/:id', (req, res) => {
  const agentId = parseInt(req.params.id);
  const agentIndex = db.agents.findIndex(a => a.id === agentId);
  
  console.log(`Aktualizuję agenta o ID ${agentId}, znaleziono na indeksie:`, agentIndex);
  
  if (agentIndex !== -1) {
    const updatedAgent = {
      ...db.agents[agentIndex],
      ...req.body,
      id: agentId // Upewniamy się, że ID się nie zmieni
    };
    
    db.agents[agentIndex] = updatedAgent;
    saveDb();
    console.log(`Zaktualizowano agenta o ID ${agentId}`);
    res.json(updatedAgent);
  } else {
    console.log(`Nie znaleziono agenta o ID ${agentId} do aktualizacji`);
    res.status(404).json({ error: 'Agent not found' });
  }
});

app.delete('/api/agents/:id', (req, res) => {
  const agentId = parseInt(req.params.id);
  const agentIndex = db.agents.findIndex(a => a.id === agentId);
  
  if (agentIndex !== -1) {
    db.agents.splice(agentIndex, 1);
    saveDb();
    console.log(`Usunięto agenta o ID ${agentId}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Agent not found' });
  }
});

app.get('/api/orders', (req, res) => {
  const { status, q, createdAt_gte, createdAt_lte } = req.query;
  
  let orders = [...db.orders];
  
  if (status && status !== 'all') {
    orders = orders.filter(o => o.status === status);
  }
  
  if (q) {
    orders = orders.filter(o => 
      o.id.toLowerCase().includes(q.toLowerCase()) ||
      o.contractorName.toLowerCase().includes(q.toLowerCase())
    );
  }
  
  if (createdAt_gte) {
    orders = orders.filter(o => new Date(o.createdAt) >= new Date(createdAt_gte));
  }
  
  if (createdAt_lte) {
    orders = orders.filter(o => new Date(o.createdAt) <= new Date(createdAt_lte));
  }
  
  console.log(`Znaleziono ${orders.length} zleceń`);
  res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id);
  console.log(`Szukam zlecenia o ID ${orderId}, typ: ${typeof orderId}`);
  console.log('Dostępne ID zleceń:', db.orders.map(o => o.id));
  
  const order = db.orders.find(o => o.id === orderId);
  console.log(`Znaleziono zlecenie:`, order ? 'tak' : 'nie');
  
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

app.get('/api/conversations', (req, res) => {
  const { orderId } = req.query;
  
  let conversations = [...db.conversations];
  
  if (orderId) {
    const orderIdInt = parseInt(orderId);
    console.log(`Szukam konwersacji dla zlecenia o ID ${orderIdInt}, typ: ${typeof orderIdInt}`);
    conversations = conversations.filter(c => c.orderId === orderIdInt);
    console.log(`Znaleziono ${conversations.length} konwersacji dla zlecenia ${orderIdInt}`);
  }
  
  res.json(conversations);
});

app.get('/api/conversations/:id', (req, res) => {
  const conversationId = parseInt(req.params.id);
  console.log(`Szukam konwersacji o ID ${conversationId}`);
  
  const conversation = db.conversations.find(c => c.id === conversationId);
  console.log(`Znaleziono konwersację:`, conversation ? 'tak' : 'nie');
  
  if (conversation) {
    res.json(conversation);
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

app.post('/api/conversations/:id/messages', (req, res) => {
  const { id } = req.params;
  const { content, sender, timestamp } = req.body;
  
  const conversation = db.conversations.find(c => c.id === parseInt(id));
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  const newMessage = {
    id: `msg_${Date.now()}`,
    content,
    sender,
    timestamp: timestamp || new Date().toISOString(),
    isRead: false
  };
  
  conversation.messages.push(newMessage);
  saveDb();
  
  res.status(201).json(newMessage);
});

app.get('/api/documents', (req, res) => {
  res.json(db.documents);
});

// Endpoint do pobierania historii agenta
app.get('/api/agents/:id/history', (req, res) => {
  const agentId = parseInt(req.params.id);
  const history = db.agentHistory && db.agentHistory[agentId] ? db.agentHistory[agentId] : [];
  console.log(`Pobrano historię agenta o ID ${agentId}, znaleziono ${history.length} wpisów`);
  res.json(history);
});

// Endpoint do czyszczenia historii agenta
app.post('/api/agents/:id/history/clear', (req, res) => {
  const agentId = parseInt(req.params.id);
  if (db.agentHistory && db.agentHistory[agentId]) {
    db.agentHistory[agentId] = [];
    saveDb();
    console.log(`Wyczyszczono historię agenta o ID ${agentId}`);
  }
  res.json({ success: true });
});

// Wszystkie pozostałe żądania kieruj do React App
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Uruchomienie serwera
// Endpointy dla baz logistycznych
// GET /api/logisticsBases - pobranie wszystkich baz logistycznych
app.get('/api/logisticsBases', (req, res) => {
  console.log('Pobieranie baz logistycznych');
  res.json(db.logisticsBases || []);
});

// GET /api/logisticsBases/:id - pobranie konkretnej bazy logistycznej
app.get('/api/logisticsBases/:id', (req, res) => {
  const baseId = parseInt(req.params.id);
  const base = db.logisticsBases.find(b => b.id === baseId);
  
  if (base) {
    res.json(base);
  } else {
    res.status(404).json({ error: 'Baza logistyczna nie znaleziona' });
  }
});

// POST /api/logisticsBases - dodanie nowej bazy logistycznej
app.post('/api/logisticsBases', (req, res) => {
  console.log('Dodawanie nowej bazy logistycznej:', req.body);
  
  // Generowanie nowego ID
  const newId = db.logisticsBases.length > 0 
    ? Math.max(...db.logisticsBases.map(b => b.id)) + 1 
    : 1;
  
  const newBase = {
    ...req.body,
    id: newId
  };
  
  db.logisticsBases.push(newBase);
  saveDb();
  
  res.status(201).json(newBase);
});

// PUT /api/logisticsBases/:id - aktualizacja istniejącej bazy logistycznej
app.put('/api/logisticsBases/:id', (req, res) => {
  const baseId = parseInt(req.params.id);
  const baseIndex = db.logisticsBases.findIndex(b => b.id === baseId);
  
  console.log(`Aktualizacja bazy logistycznej o ID ${baseId}, znaleziono na indeksie:`, baseIndex);
  
  if (baseIndex !== -1) {
    // Aktualizacja danych z zachowaniem ID
    const updatedBase = {
      ...req.body,
      id: baseId
    };
    
    db.logisticsBases[baseIndex] = updatedBase;
    saveDb();
    
    res.json(updatedBase);
  } else {
    res.status(404).json({ error: 'Baza logistyczna nie znaleziona' });
  }
});

// DELETE /api/logisticsBases/:id - usunięcie bazy logistycznej
app.delete('/api/logisticsBases/:id', (req, res) => {
  const baseId = parseInt(req.params.id);
  const baseIndex = db.logisticsBases.findIndex(b => b.id === baseId);
  
  console.log(`Usuwanie bazy logistycznej o ID ${baseId}, znaleziono na indeksie:`, baseIndex);
  
  if (baseIndex !== -1) {
    db.logisticsBases.splice(baseIndex, 1);
    saveDb();
    
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Baza logistyczna nie znaleziona' });
  }
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
  console.log(`API dostępne pod adresem: http://localhost:${PORT}/api`);
  console.log(`Aplikacja React dostępna pod adresem: http://localhost:${PORT}`);
});
