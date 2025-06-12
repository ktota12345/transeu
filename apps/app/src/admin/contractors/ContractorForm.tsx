import {
    Edit,
    Create,
    SimpleForm,
    TextInput,
    BooleanInput,
    ArrayInput,
    SimpleFormIterator,
    ReferenceInput, SelectInput
} from 'react-admin';
import {Typography} from '@mui/material';
import React from 'react';

const ContractorFields = () => (
    <>
        <TextInput source="legalName" label="Pełna nazwa" fullWidth/>
        <TextInput source="taxId" label="NIP / ID podatkowy"/>
        <TextInput source="address" label="Adres"/>
        <TextInput source="postalCode" label="Kod pocztowy"/>
        <TextInput source="city" label="Miasto"/>
        <ReferenceInput
            source="country"
            reference="countries"
            label="Kraj"
            perPage={250}
            sort={{field: 'name', order: 'ASC'}}
            filterToQuery={(searchText: string) => ({name: searchText})} 
        >
            <SelectInput optionText="name" optionValue="code" />
        </ReferenceInput>
        <BooleanInput source="blacklisted" label="Czarna lista"/>
        <TextInput source="blacklistReason" label="Powód blokady" fullWidth/>
    </>
);

const ContractorAliasesInput = () => (
    <>
        <Typography variant="h6">Aliasy</Typography>
        <ArrayInput source="aliases">
            <SimpleFormIterator>
                <TextInput source="name" label="Alias"/>
            </SimpleFormIterator>
        </ArrayInput>
    </>
);

export const ContractorEdit = () => (
    <Edit mutationMode="pessimistic">
        <SimpleForm>
            <ContractorFields/>
            <ContractorAliasesInput/>
        </SimpleForm>
    </Edit>
);
export const ContractorCreate = () => (
    <Create mutationMode="pessimistic">
        <SimpleForm>
            <ContractorFields/>
            <ContractorAliasesInput/>
        </SimpleForm>
    </Create>
);
