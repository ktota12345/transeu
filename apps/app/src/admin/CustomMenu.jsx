import React, { useState } from 'react';
import { Menu, MenuItemLink, useSidebarState } from 'react-admin';
import { Link } from 'react-router-dom';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import {
    ExpandLess,
    ExpandMore,
    Dashboard as DashboardIcon,
    LocalOffer as OfferIcon,
    LocalShipping as CarrierIcon,
    DirectionsCar as CarIcon,
    People as DriverIcon,
    MenuBook as DictionaryIcon,
    Settings as ConfigIcon,
    Category as TypeIcon,
    Security as SecuringIcon,
    SwapHoriz as SwapBodyIcon,
    ViewModule as BodyPropertyIcon,
    Build as EquipmentIcon,
    Tune as SearchSetupIcon,
    VpnKey as TokenIcon,
    PeopleAlt as ContractorIcon
} from '@mui/icons-material';
import { Collapse, List } from '@mui/material';

export const CustomMenu = () => {
    const [openCars, setOpenCars] = useState(false);
    const [openConfig, setOpenConfig] = useState(false);
    const [open] = useSidebarState(); // open === true jeśli menu rozwinięte


    return (
        <Menu>
            <MenuItemLink
                to={`${process.env.REACT_APP_ADMIN_PREFIX}contractors`}
                primaryText="Kontrahenci"
                leftIcon={<ContractorIcon />}
            />
            <MenuItemLink
                to={`${process.env.REACT_APP_ADMIN_PREFIX}carriers`}
                primaryText="Przewoźnicy"
                leftIcon={<CarrierIcon />}
            />
            <MenuItemLink
                to={`${process.env.REACT_APP_ADMIN_PREFIX}drivers`}
                primaryText="Kierowcy"
                leftIcon={<DriverIcon />}
            />
            <MenuItemLink
                to={`${process.env.REACT_APP_ADMIN_PREFIX}cars`}
                primaryText="Samochody"
                leftIcon={<CarIcon />}
            />
            <MenuItemLink
                to={`${process.env.REACT_APP_ADMIN_PREFIX}car-schedule-offers`}
                primaryText="Oferty"
                leftIcon={<OfferIcon />}
            />
            <ListItemButton onClick={() => setOpenCars(!openCars)}>
                <ListItemIcon>
                    <DictionaryIcon />
                </ListItemIcon>
                {open && (
                    <>
                        <ListItemText primary="Słowniki" />
                        {openCars ? <ExpandLess /> : <ExpandMore />}
                    </>
                )}
            </ListItemButton>

            <Collapse in={openCars} timeout="auto" unmountOnExit>
                <List disablePadding>
                    <MenuItemLink
                        to={`${process.env.REACT_APP_ADMIN_PREFIX}vehicle-types`}
                        primaryText="Typy pojazdów"
                        leftIcon={<TypeIcon />}
                        style={{ paddingLeft: open?32:16 }}
                    />
                    <MenuItemLink
                        to={`${process.env.REACT_APP_ADMIN_PREFIX}vehicle-body`}
                        primaryText="Typy zabudowy"
                        leftIcon={<TypeIcon />}
                        style={{ paddingLeft: open?32:16 }}
                    />
                    <MenuItemLink
                        to={`${process.env.REACT_APP_ADMIN_PREFIX}vehicle-load-securing`}
                        primaryText="Zabezpieczenia ładunku"
                        leftIcon={<SecuringIcon />}
                        style={{ paddingLeft: open?32:16 }}
                    />
                    <MenuItemLink
                        to={`${process.env.REACT_APP_ADMIN_PREFIX}swap-body`}
                        primaryText="Rodzaje nadwozia"
                        leftIcon={<SwapBodyIcon />}
                        style={{ paddingLeft: open?32:16 }}
                    />
                    <MenuItemLink
                        to={`${process.env.REACT_APP_ADMIN_PREFIX}body-property`}
                        primaryText="Rodzaje zabudowy"
                        leftIcon={<BodyPropertyIcon />}
                        style={{ paddingLeft: open?32:16 }}
                    />
                    <MenuItemLink
                        to={`${process.env.REACT_APP_ADMIN_PREFIX}vehicle-equipment`}
                        primaryText="Wyposażenie pojazdu"
                        leftIcon={<EquipmentIcon />}
                        style={{ paddingLeft: open?32:16 }}
                    />
                </List>
            </Collapse>

            <ListItemButton onClick={() => setOpenConfig(!openConfig)}>
                <ListItemIcon>
                    <ConfigIcon />
                </ListItemIcon>
                {open && (
                    <>
                        <ListItemText primary="Konfiguracja" />
                        {openCars ? <ExpandLess /> : <ExpandMore />}
                    </>
                )}
            </ListItemButton>
            <Collapse in={openConfig} timeout="auto" unmountOnExit>
                <List disablePadding>
                    <MenuItemLink
                        to={`${process.env.REACT_APP_ADMIN_PREFIX}search-schedule-setup`}
                        primaryText="Wyszukiwanie"
                        leftIcon={<SearchSetupIcon />}
                        style={{ paddingLeft: open?32:16 }}
                    />
                    <MenuItemLink
                        to={`${process.env.REACT_APP_NEST_API_URL}/trans-eu/auth/redirect`}
                        target="_blank"
                        primaryText="TransEuToken"
                        leftIcon={<TokenIcon />}
                        style={{ paddingLeft: open?32:16 }}
                    />
                </List>
            </Collapse>
        </Menu>
    );
};
