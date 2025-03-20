const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3002;

// Dane z db.json
const dbPath = path.join(__dirname, 'db.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('Załadowano bazę danych. Liczba zleceń:', db.orders.length);
console.log('Identyfikatory zleceń:', db.orders.map(o => o.id));

// Funkcja do zapisywania zmian w db.json
const saveDb = () => {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
};

// Middleware do obsługi JSON
app.use(express.json());

// Statyczne pliki z katalogu build
app.use(express.static(path.join(__dirname, 'build')));

// Middleware do logowania zapytań
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
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

// Wszystkie pozostałe żądania kieruj do React App
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
  console.log(`API dostępne pod adresem: http://localhost:${PORT}/api`);
  console.log(`Aplikacja React dostępna pod adresem: http://localhost:${PORT}`);
});
