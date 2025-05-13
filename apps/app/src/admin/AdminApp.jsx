import React from 'react';
import { Admin, Resource } from 'react-admin';
import dataProvider from './dataProvider';
import CarList from './cars/CarList';
import {CarCreate} from './cars/CarCreate';
import {CarEdit} from './cars/CarEdit';
import {CustomLayout} from "./CustomLayout";

import DriverList from './drivers/DriverList';
import DriverEdit from './drivers/DriverEdit';
import DriverCreate from './drivers/DriverCreate';
const AdminApp = () => (
    <Admin dataProvider={dataProvider} layout={CustomLayout} basename="/admin">
        <Resource name="cars" label="Samochody" list={CarList} create={CarCreate} edit={CarEdit} />
        <Resource
            name="drivers"
            list={DriverList}
            edit={DriverEdit}
            create={DriverCreate}
        />
    </Admin>
);

export default AdminApp;
