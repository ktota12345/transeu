import React from 'react';
import {ChakraProvider} from '@chakra-ui/react';
import {BrowserRouter as Router, Routes, Route, Navigate, useLocation} from 'react-router-dom';
import {Provider} from 'react-redux';
import {store} from './store/store';
import {AgentsList} from './components/agents/AgentsList';
import {AgentForm} from './components/agents/AgentForm';
import {LoginForm} from './components/auth/LoginForm';
import {isAuthenticated} from './components/auth/auth';
import Dashboard from './components/dashboard/Dashboard';
import Layout from './components/layout/Layout';
import OrdersList from './components/orders/OrdersList';
import OrderCard from './components/orders/OrderCard';

const RequireAuth = ({children}: { children: JSX.Element }) => {
    const location = useLocation();

    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    return children;
};



function App() {
    return (
        <Provider store={store}>
            <ChakraProvider>
                <Router>
                        <Routes>
                            <Route path="/login" element={<LoginForm onLoginSuccess={() => window.location.replace('/')}/>}/>

                            <Route path="/" element={<Layout><RequireAuth><Dashboard /></RequireAuth></Layout>} />
                            <Route path="/agents" element={<Layout><RequireAuth><AgentsList /></RequireAuth></Layout>} />
                            <Route path="/agent/new" element={<Layout><RequireAuth><AgentForm onSubmit={console.log} /></RequireAuth></Layout>} />
                            <Route path="/agent/:id" element={<Layout><RequireAuth><AgentForm onSubmit={console.log} /></RequireAuth></Layout>} />
                            <Route path="/orders" element={<Layout><OrdersList /></Layout>} />
                            <Route path="/order/:id" element={<Layout><OrderCard /></Layout>} />
                        </Routes>
                </Router>
            </ChakraProvider>
        </Provider>
    )
        ;
}

export default App;
