import { Layout } from 'react-admin';
import { CustomMenu } from './CustomMenu.jsx';
import CustomAppBar from './CustomAppBar';

export const CustomLayout = ({ children }) => (
    <Layout menu={CustomMenu} appBar={CustomAppBar}>
        {children}
    </Layout>
);
