import React from 'react';
import {
    UserMenu,
    MenuItemLink,
    useRedirect,
    Logout,
} from 'react-admin';
import { useAuth } from '../components/auth/useAuth';

import md5 from "md5";

const CustomUserMenu = (props) => {
    const redirect = useRedirect();
    const { logout, getUserData } = useAuth();

    const { email: userEmail, name: userName , role:userRole} = getUserData();

    const gravatarUrl = `https://www.gravatar.com/avatar/${md5(userEmail.trim().toLowerCase())}?s=24&d=identicon`;
    return (
        <UserMenu {...props}
            icon={<img src={gravatarUrl} alt={userName} style={{ borderRadius: '50%', width:24, height:24 }} />}
        >
            <Logout
                onClick={() => {
                    logout();
                    redirect('/');
                }}
                primaryText="Wyloguj"
            />
        </UserMenu>
    );
};

export default CustomUserMenu;
