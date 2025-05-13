import React from 'react';
import {Menu, MenuItemLink} from 'react-admin';
import {Link} from 'react-router-dom';

export const CustomMenu = () => (
    <Menu>
        <MenuItemLink to="/" primaryText="Dashboard"/>
        <MenuItemLink
            component={Link}
            to="/quick-search" // zmieniamy to na "/quick-search"
            primaryText="Szybkie wyszukiwanie"
        />
        <MenuItemLink
            component={Link}
            to="/agents"
            primaryText="Agenci"
        />
        <MenuItemLink
            component={Link}
            to="/schedule"
            primaryText="Harmonogram"
        />
        <MenuItemLink
            component={Link}
            to="/settings"
            primaryText="Ustawienia"
        />
        <MenuItemLink to="/cars" primaryText="Samochody"/>
        <MenuItemLink to="/drivers" primaryText="Kierowcy"/>
    </Menu>
);
