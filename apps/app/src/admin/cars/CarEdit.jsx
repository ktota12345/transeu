import { Edit, SimpleForm, TextInput } from 'react-admin';

export const CarEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="name" />
            <TextInput source="registrationNumber" />
            <TextInput source="carType" />
            <TextInput source="trailerType" />
        </SimpleForm>
    </Edit>
);
