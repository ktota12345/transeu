import React from 'react';
import { Admin, Resource } from 'react-admin';
import dataProvider from './dataProvider';
import CarList from './cars/CarList';
import {CarCreate} from './cars/CarCreate';
import {CarEdit} from './cars/CarEdit';
import {CustomLayout} from "./CustomLayout";

const AdminApp = () => (
    <Admin dataProvider={dataProvider} layout={CustomLayout}>
        <Resource name="cars" label="Samochody" list={CarList} create={CarCreate} edit={CarEdit} />
    </Admin>
);

export default AdminApp;
