import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3002/api';

// Pobieranie listy zleceń z możliwością filtrowania
export const fetchOrders = async (filters = {}) => {
  try {
    let url = `${API_URL}/orders`;
    const params = new URLSearchParams();

    // Dodawanie filtrów do parametrów URL
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }

    if (filters.search) {
      params.append('q', filters.search);
    }

    if (filters.dateRange?.from) {
      params.append('createdAt_gte', filters.dateRange.from);
    }

    if (filters.dateRange?.to) {
      params.append('createdAt_lte', filters.dateRange.to);
    }

    if (filters.assignedAgent) {
      params.append('assignedAgentId', filters.assignedAgent);
    }

    // Sortowanie
    if (filters.sortBy) {
      const sortDirection = filters.sortDirection || 'asc';
      // Obsługa zagnieżdżonych właściwości
      let sortField = filters.sortBy;
      
      // Dodaj znak minus przed polem, jeśli sortowanie jest malejące
      if (sortDirection === 'desc') {
        sortField = `-${sortField}`;
      }
      
      console.log(`API Sortowanie: pole=${sortField}, kierunek=${sortDirection}`);
      
      params.append('_sort', sortField);
      // Nie dodajemy _order, ponieważ używamy nowego formatu z minusem dla desc
    }

    // Paginacja
    if (filters.page) {
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const start = (page - 1) * limit;
      
      params.append('_start', start.toString());
      params.append('_limit', limit.toString());
    }

    // Dodanie parametrów do URL jeśli istnieją
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log(`Wysyłam zapytanie do: ${url}`);

    const response = await axios.get(url);
    
    // Pobierz całkowitą liczbę zleceń dla paginacji
    const total = parseInt(response.headers['x-total-count'] || '0');
    
    return {
      orders: response.data,
      total: total
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Pobieranie pojedynczego zlecenia
export const fetchOrder = async (orderId) => {
  try {
    // Pobierz zlecenie
    const orderResponse = await axios.get(`${API_URL}/orders/${orderId}`);
    
    // Pobierz konwersację dla zlecenia
    const conversationResponse = await axios.get(`${API_URL}/conversations?orderId=${orderId}`);
    
    // Połącz dane zlecenia z konwersacją
    const order = orderResponse.data;
    order.conversation = conversationResponse.data[0] || null;
    
    return order;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

// Akceptacja zlecenia
export const acceptOrder = async (orderId) => {
  try {
    // Pobierz aktualne zlecenie
    const response = await axios.get(`${API_URL}/orders/${orderId}`);
    const order = response.data;
    
    // Zaktualizuj status
    const updatedOrder = {
      ...order,
      status: 'in_progress',
      updatedAt: new Date().toISOString()
    };
    
    // Zapisz zmiany
    const saveResponse = await axios.put(`${API_URL}/orders/${orderId}`, updatedOrder);
    
    // Dodaj wiadomość do konwersacji
    await addSystemMessage(orderId, 'Zlecenie zostało zaakceptowane.');
    
    return saveResponse.data;
  } catch (error) {
    console.error(`Error accepting order ${orderId}:`, error);
    throw error;
  }
};

// Odrzucenie zlecenia
export const rejectOrder = async (orderId, reason) => {
  try {
    // Pobierz aktualne zlecenie
    const response = await axios.get(`${API_URL}/orders/${orderId}`);
    const order = response.data;
    
    // Zaktualizuj status
    const updatedOrder = {
      ...order,
      status: 'rejected',
      updatedAt: new Date().toISOString()
    };
    
    // Zapisz zmiany
    const saveResponse = await axios.put(`${API_URL}/orders/${orderId}`, updatedOrder);
    
    // Dodaj wiadomość do konwersacji
    await addSystemMessage(orderId, `Zlecenie zostało odrzucone. Powód: ${reason}`);
    
    return saveResponse.data;
  } catch (error) {
    console.error(`Error rejecting order ${orderId}:`, error);
    throw error;
  }
};

// Przekazanie zlecenia do operatora
export const transferToOperator = async (orderId, operatorId) => {
  try {
    // Pobierz aktualne zlecenie
    const response = await axios.get(`${API_URL}/orders/${orderId}`);
    const order = response.data;
    
    // Zaktualizuj status
    const updatedOrder = {
      ...order,
      status: 'transferred',
      operatorId: operatorId,
      updatedAt: new Date().toISOString()
    };
    
    // Zapisz zmiany
    const saveResponse = await axios.put(`${API_URL}/orders/${orderId}`, updatedOrder);
    
    // Dodaj wiadomość do konwersacji
    await addSystemMessage(orderId, `Zlecenie zostało przekazane do operatora.`);
    
    return saveResponse.data;
  } catch (error) {
    console.error(`Error transferring order to operator:`, error);
    throw error;
  }
};

// Przekazanie zlecenia do innego agenta
export const transferToAgent = async (orderId, agentId) => {
  try {
    // Pobierz aktualne zlecenie
    const response = await axios.get(`${API_URL}/orders/${orderId}`);
    const order = response.data;
    
    // Pobierz dane agenta automatyzacji
    const agentResponse = await axios.get(`${API_URL}/agents/${agentId}`);
    const agent = agentResponse.data;
    
    // Zaktualizuj status
    const updatedOrder = {
      ...order,
      assignedAgentId: agentId,
      assignedAgentName: agent.name,
      assignedAgentType: 'automation',
      updatedAt: new Date().toISOString()
    };
    
    // Zapisz zmiany
    const result = await axios.put(`${API_URL}/orders/${orderId}`, updatedOrder);
    
    // Dodaj wiadomość do konwersacji
    await addSystemMessage(orderId, `Zlecenie zostało przekazane do agenta automatyzacji ${agent.name}.`);
    
    return result.data;
  } catch (error) {
    console.error(`Error transferring order to agent:`, error);
    throw error;
  }
};

// Wysyłanie wiadomości
export const sendMessage = async (conversationId, content, attachments = []) => {
  try {
    // Pobierz konwersację
    const response = await axios.get(`${API_URL}/conversations/${conversationId}`);
    const conversation = response.data;
    
    // Utwórz nową wiadomość
    const newMessage = {
      id: Date.now(),
      content,
      sentAt: new Date().toISOString(),
      senderId: 'agent', // Domyślnie agent
      senderName: 'System Agent',
      attachments: attachments || []
    };
    
    // Dodaj nową wiadomość do konwersacji
    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, newMessage]
    };
    
    // Zapisz zmiany
    const saveResponse = await axios.put(`${API_URL}/conversations/${conversation.id}`, updatedConversation);
    
    return newMessage;
  } catch (error) {
    console.error(`Error sending message:`, error);
    throw error;
  }
};

// Pobieranie sugerowanych odpowiedzi do konwersacji
export const fetchSuggestedResponses = async (conversationId) => {
  try {
    return [
      "Dziękuję za informację. Zapoznam się z szczegółami zlecenia.",
      "Proszę o więcej informacji na temat ładunku.",
      "Czy możemy ustalić inny termin dostawy?",
      "Potwierdzam przyjęcie zlecenia. Przystępujemy do realizacji.",
      "Niestety nie możemy zrealizować tego zlecenia w podanym terminie."
    ];
  } catch (error) {
    console.error('Error fetching suggested responses:', error);
    throw error;
  }
};

// Pobieranie operatorów
export const fetchOperators = async () => {
  try {
    const response = await axios.get(`${API_URL}/operators`);
    return response.data;
  } catch (error) {
    console.error('Error fetching operators:', error);
    throw error;
  }
};

// Pobieranie agentów
export const fetchAgents = async () => {
  try {
    const response = await axios.get(`${API_URL}/agents`);
    return response.data;
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

// Pomocnicza funkcja do dodawania wiadomości systemowych
const addSystemMessage = async (orderId, content) => {
  try {
    // Pobierz konwersację dla zlecenia
    const response = await axios.get(`${API_URL}/conversations?orderId=${orderId}`);
    const conversation = response.data[0];
    
    if (conversation) {
      // Utwórz nową wiadomość systemową
      const newMessage = {
        id: Date.now(),
        content,
        sentAt: new Date().toISOString(),
        senderId: 'system',
        senderName: 'System',
        attachments: []
      };
      
      // Dodaj wiadomość do konwersacji
      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, newMessage]
      };
      
      // Zapisz zmiany
      await axios.put(`${API_URL}/conversations/${conversation.id}`, updatedConversation);
    }
  } catch (error) {
    console.error('Error adding system message:', error);
    // Nie rzucamy błędu, aby nie przerywać głównej operacji
  }
};
