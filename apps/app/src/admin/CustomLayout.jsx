import { Layout } from 'react-admin';
import { CustomMenu } from './CustomMenu.jsx';

export const CustomLayout = ({ children }) => (
    <Layout menu={CustomMenu}>
        {children}
    </Layout>
);
