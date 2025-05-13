import React from 'react';
import { Admin, Resource } from 'react-admin';
import dataProvider from './dataProvider';
import CarList from './cars/CarList';
import CustomMenu from './CustomMenu';
import {CustomLayout} from "./CustomLayout";

const AdminApp = () => (
    <Admin dataProvider={dataProvider} layout={CustomLayout}>
        <Resource name="cars" list={CarList} />
    </Admin>
);

export default AdminApp;
