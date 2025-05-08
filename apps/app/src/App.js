import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AgentsList } from './components/agents/AgentsList';
import { AgentForm } from './components/agents/AgentForm';
import Dashboard from './components/dashboard/Dashboard';
import Layout from './components/layout/Layout';
import OrdersList from './components/orders/OrdersList';
import OrderCard from './components/orders/OrderCard';
import theme from './theme/theme';

function App() {
    return (
        <Provider store={store}>
            <ChakraProvider theme={theme}>
                <Router>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/agents" element={<AgentsList />} />
                            <Route path="/agent/new" element={<AgentForm onSubmit={console.log} />} />
                            <Route path="/agent/:id" element={<AgentForm onSubmit={console.log} />} />
                            <Route path="/orders" element={<OrdersList />} />
                            <Route path="/order/:id" element={<OrderCard />} />
                        </Routes>
                    </Layout>
                </Router>
            </ChakraProvider>
        </Provider>
    );
}

export default App;
