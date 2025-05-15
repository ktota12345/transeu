import React from 'react';
import {Admin, Resource} from 'react-admin';
import dataProvider from './dataProvider';
import CarList from './cars/CarList';
import {CarCreate} from './cars/CarCreate';
import {CarEdit} from './cars/CarEdit';
import {CustomLayout} from "./CustomLayout";

import DriverList from './drivers/DriverList';
import DriverEdit from './drivers/DriverEdit';
import DriverCreate from './drivers/DriverCreate';

import CarScheduleOfferList from './carScheduleOffers/CarScheduleOfferList';
import CarScheduleOfferEdit from "./carScheduleOffers/CarScheduleOfferEdit";

import CarrierList from "./carriers/CarrierList";
import CarrierShow from "./carriers/CarrierShow";

import SearchScheduleSetupList from "./searchScheduleSetups/SearchScheduleSetupList";
import SearchScheduleSetupEdit from "./searchScheduleSetups/SearchScheduleSetupEdit";
import SearchScheduleSetupCreate     from "./searchScheduleSetups/SearchScheduleSetupCreate";

const AdminApp = () => (
    <Admin
        dataProvider={dataProvider}
        layout={CustomLayout}
        basename={process.env.REACT_APP_ADMIN_PREFIX}

    >
        <Resource name="cars" label="Samochody" list={CarList} create={CarCreate} edit={CarEdit}/>
        <Resource
            name="drivers"
            list={DriverList}
            edit={DriverEdit}
            create={DriverCreate}
        />

        <Resource
            name="car-schedule-offers"
            list={CarScheduleOfferList}
            edit={CarScheduleOfferEdit}
        />

        <Resource
            name="carriers"
            list={CarrierList}
            show={CarrierShow}
        />
        <Resource
            name="search-schedule-setup"
            list={SearchScheduleSetupList}
            edit={SearchScheduleSetupEdit}
            create={SearchScheduleSetupCreate}
        />
    </Admin>
);

export default AdminApp;
