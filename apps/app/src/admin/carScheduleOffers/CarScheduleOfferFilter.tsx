import {
    ReferenceInput,
    SelectInput,
    Filter,
    TextInput,
} from 'react-admin';
import React from "react";
export const CarScheduleOfferFilter = (props:any) => (
    <Filter {...props}>
        <ReferenceInput label="Samochód" source="carId" reference="cars">
            <SelectInput optionText={(record: any) => `${record.name} (${record.registrationNumber})`} />
        </ReferenceInput>
        <TextInput label="Skąd" source="fromLocation" />
        <TextInput label="Dokąd" source="toLocation" />
    </Filter>
);