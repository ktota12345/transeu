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
import SearchScheduleSetupCreate from "./searchScheduleSetups/SearchScheduleSetupCreate";

import VehicleTypeList from './vehicleType/VehicleTypeList';
import {VehicleTypeEdit, VehicleTypeCreate} from './vehicleType/VehicleType';

import VehicleLoadSecuringList from './vehicleLoadSecuring/VehicleLoadSecuringList';
import {VehicleLoadSecuringEdit, VehicleLoadSecuringCreate} from './vehicleLoadSecuring/VehicleLoadSecuring';


// import {
//     VehicleLoadSecuringList,
//     VehicleLoadSecuringEdit,
// } from './vehicleLoadSecuring';
// import {
//     VehicleEquipmentList,
//     VehicleEquipmentEdit,
// } from './vehicleEquipment';
// import {
//     SwapBodyList,
//     SwapBodyEdit,
// } from './swapBody';
// import {
//     BodyPropertyList,
//     BodyPropertyEdit,
// } from './bodyProperty';


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

        <Resource name={"vehicle-types"}
                  label="Typy pojazdów"
                  list={VehicleTypeList}
                  edit={VehicleTypeEdit}
                  create={VehicleTypeCreate}
        />
        <Resource name={"vehicle-load-securing"}
                  label="Zabezpieczenia ładunku"
                  list={VehicleLoadSecuringList}
                  edit={VehicleLoadSecuringEdit}
                  create={VehicleLoadSecuringCreate}
        />
        <Resource name={"vehicle-equipment"}
                    label="Wyposażenie pojazdu"
                    list={VehicleLoadSecuringList}
                    edit={VehicleLoadSecuringEdit}
                    create={VehicleLoadSecuringCreate}
        />
        <Resource name={"swap-body"}
                  label="Rodzaje nadwozia"
                  list={VehicleLoadSecuringList}
                  edit={VehicleLoadSecuringEdit}
                  create={VehicleLoadSecuringCreate}
        />
        <Resource name={"body-property"}
                  label="Rodzaje zabudowy"
                  list={VehicleLoadSecuringList}
                  edit={VehicleLoadSecuringEdit}
                  create={VehicleLoadSecuringCreate}
        />

    </Admin>
);

export default AdminApp;
