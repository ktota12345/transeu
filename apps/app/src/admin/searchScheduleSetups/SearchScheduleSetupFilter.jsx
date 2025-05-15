import React from 'react';
import { Filter, TextInput, BooleanInput } from 'react-admin';

export const SearchScheduleSetupFilters = (props) => (
    <Filter {...props}>
        <TextInput label="Szukaj po nazwie" source="name" alwaysOn />
        <BooleanInput label="Tylko domyślne" source="isDefault" />
    </Filter>
);
