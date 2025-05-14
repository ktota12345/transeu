import React from 'react';
import { Filter, TextInput, SelectInput } from 'react-admin';
import {carTypes} from "../../data/dictOptions";


export const CarFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search by name" source="name" alwaysOn />
        <TextInput label="Search by registration number" source="registrationNumber" />
        <SelectInput label="Car type" source="carType" choices={carTypes} />
    </Filter>
);
