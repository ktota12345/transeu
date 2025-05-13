import React from 'react';
import { Filter, TextInput, SelectInput } from 'react-admin';

// Przykładowe dane do selecta (jeśli masz predefiniowane typy samochodów)
const carTypes = [
    { id: 'Sedan', name: 'Sedan' },
    { id: 'SUV', name: 'SUV' },
    { id: 'Truck', name: 'Truck' },
    { id: 'Van', name: 'Van' },
];

export const CarFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search by name" source="name" alwaysOn />
        <TextInput label="Search by registration number" source="registrationNumber" />
        <SelectInput label="Car type" source="carType" choices={carTypes} />
    </Filter>
);
