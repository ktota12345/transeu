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
import Settings from './components/settings/Settings';
import Schedule from './components/schedule/Schedule';
import QuickSearchPage from './pages/QuickSearchPage';

const RequireAuth = ({children}: { children: JSX.Element }) => {
    const location = useLocation();

    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    return <Layout>{children}</Layout>;
};



function App() {
    return (
        <Provider store={store}>
            <ChakraProvider>
                <Router>
                        <Routes>
                            <Route path="/login" element={<LoginForm onLoginSuccess={() => window.location.replace('/')}/>}/>

                            <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
                            <Route path="/agents" element={<RequireAuth><AgentsList /></RequireAuth>} />
                            <Route path="/agent/new" element={<RequireAuth><RequireAuth><AgentForm onSubmit={console.log} /></RequireAuth></RequireAuth>} />
                            <Route path="/agent/:id" element={<RequireAuth><RequireAuth><AgentForm onSubmit={console.log} /></RequireAuth></RequireAuth>} />
                            <Route path="/orders" element={<RequireAuth><OrdersList /></RequireAuth>} />
                            <Route path="/order/:id" element={<RequireAuth><OrderCard /></RequireAuth>} />
                            <Route path="/schedule" element={<RequireAuth><Schedule /></RequireAuth>} />
                            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
                            <Route path="/quick-search" element={<RequireAuth><QuickSearchPage /></RequireAuth>} />
                        </Routes>
                </Router>
            </ChakraProvider>
        </Provider>
    )
        ;
}

export default App;
