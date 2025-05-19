import {AutocompleteInput, Edit, ReferenceInput, SimpleForm, TextInput} from 'react-admin';

const DriverEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="name" label="Imię" />
            <TextInput source="surname" label="Nazwisko" />
            <TextInput source="phone" label="Telefon" />
            <TextInput source="email" label="Email" />
            <ReferenceInput source="carrierId" reference="carriers" label="Przewoźnik" allowEmpty>
                <AutocompleteInput optionText="name" />
            </ReferenceInput>
        </SimpleForm>
    </Edit>
);

export default DriverEdit;
