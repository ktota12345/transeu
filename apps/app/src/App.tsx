import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AgentsList } from './components/agents/AgentsList';
import { AgentForm } from './components/agents/AgentForm';

function App() {
  return (
    <Provider store={store}>
      <ChakraProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AgentsList />} />
            <Route path="/agent/new" element={<AgentForm />} />
            <Route path="/agent/:id" element={<AgentForm />} />
          </Routes>
        </Router>
      </ChakraProvider>
    </Provider>
  );
}

export default App;
