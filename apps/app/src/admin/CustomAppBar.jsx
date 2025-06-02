import { AppBar } from 'react-admin';
import CustomUserMenu from './CustomUserMenu';

const CustomAppBar = (props) => <AppBar {...props} userMenu={<CustomUserMenu />} />;
export default CustomAppBar;
