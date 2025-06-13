import {Layout, useSidebarState} from 'react-admin';
import { CustomMenu } from './CustomMenu.jsx';
import CustomAppBar from './CustomAppBar';

export const CustomLayout = ({ children }) => {
    const isSidebarOpen = useSidebarState();
    const sidebarWidth = isSidebarOpen[0] ? 260 : 55;
    return (
    <Layout menu={CustomMenu} appBar={CustomAppBar}>
        <div style={{maxWidth: `calc(100vw - ${sidebarWidth}px)`}}>
            {children}
        </div>
    </Layout>);
};
