import React from 'react';
import AgentHistory from '../components/agents/AgentHistory'; // Upewnij się, że ścieżka jest poprawna

const AgentHistoryPage = () => {
  // Ten komponent nie potrzebuje niczego poza renderowaniem AgentHistory
  // AgentHistory sam pobierze ID z useParams
  return <AgentHistory />;
};

export default AgentHistoryPage;
