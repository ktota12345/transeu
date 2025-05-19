import React from 'react';
import {Filter, TextInput, ReferenceInput, AutocompleteInput} from 'react-admin';

export const CarFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search by name" source="name" alwaysOn/>
        <TextInput label="Search by registration number" source="registrationNumber"/>
        <ReferenceInput label="Przewoźnik" source="carrierId" reference="carriers" allowEmpty>
            <AutocompleteInput style={{width:"500px"}} optionText="name"/>
        </ReferenceInput>
    </Filter>
);
