import React, { useState } from 'react';
import { Menu, MenuItemLink } from 'react-admin';
import { Link } from 'react-router-dom';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, List } from '@mui/material';

export const CustomMenu = () => {
        const [openCars, setOpenCars] = useState(false);
        const [openConfig, setOpenConfig] = useState(false);

        return (
            <Menu>
                    <MenuItemLink component={Link} to="/" primaryText="Dashboard" />
                    <MenuItemLink component={Link} to="/quick-search" primaryText="Szybkie wyszukiwanie" />
                    <MenuItemLink component={Link} to="/agents" primaryText="Agenci" />
                    <MenuItemLink component={Link} to="/schedule" primaryText="Harmonogram" />
                    <MenuItemLink component={Link} to="/settings" primaryText="Ustawienia" />
                    <MenuItemLink to={`${process.env.REACT_APP_ADMIN_PREFIX}car-schedule-offers`} primaryText="Oferty" />
                    <MenuItemLink to={`${process.env.REACT_APP_ADMIN_PREFIX}carriers`} primaryText="Przewoźnicy" />

                    <MenuItemLink to={`${process.env.REACT_APP_ADMIN_PREFIX}cars`} onClick={() => setOpenCars(!openCars)}>
                            Flota {openCars ? <ExpandLess /> : <ExpandMore />}
                    </MenuItemLink>
                    <Collapse in={openCars} timeout="auto" unmountOnExit>
                            <List disablePadding>
                                    <MenuItemLink
                                        to={`${process.env.REACT_APP_ADMIN_PREFIX}cars`}
                                        primaryText="Samochody"
                                        style={{ paddingLeft: 32 }}
                                    />
                                    <MenuItemLink
                                        to={`${process.env.REACT_APP_ADMIN_PREFIX}drivers`}
                                        primaryText="Kierowcy"
                                        style={{ paddingLeft: 32 }}
                                    />
                                <MenuItemLink
                                    to={`${process.env.REACT_APP_ADMIN_PREFIX}vehicle-types`}
                                    primaryText="Typy pojazdów"
                                    style={{ paddingLeft: 32 }}
                                />
                                <MenuItemLink
                                    to={`${process.env.REACT_APP_ADMIN_PREFIX}vehicle-load-securing`}
                                    primaryText="Zabezpieczenia ładunku"
                                    style={{ paddingLeft: 32 }}
                                />
                                <MenuItemLink
                                    to={`${process.env.REACT_APP_ADMIN_PREFIX}swap-body`}
                                    primaryText="Rodzaje nadwozia"
                                    style={{ paddingLeft: 32 }}
                                />
                                <MenuItemLink
                                    to={`${process.env.REACT_APP_ADMIN_PREFIX}body-property`}
                                    primaryText="Rodzaje zabudowy"
                                    style={{ paddingLeft: 32 }}
                                />
                                <MenuItemLink
                                    to={`${process.env.REACT_APP_ADMIN_PREFIX}vehicle-equipment`}
                                    style={{ paddingLeft: 32 }}
                                    primaryText="Wyposażenie pojazdu"
                                />

                            </List>
                    </Collapse>

                    {/* Konfiguracja */}
                    <MenuItemLink to="#" onClick={() => setOpenConfig(!openConfig)}>
                            Konfiguracja {openConfig ? <ExpandLess /> : <ExpandMore />}
                    </MenuItemLink>
                    <Collapse in={openConfig} timeout="auto" unmountOnExit>
                            <List disablePadding>
                                    <MenuItemLink
                                        to={`${process.env.REACT_APP_ADMIN_PREFIX}search-schedule-setup`}
                                        primaryText="Ustawienia wyszukiwania"
                                        style={{ paddingLeft: 32 }}
                                    />
                            </List>
                    </Collapse>
            </Menu>
        );
};
