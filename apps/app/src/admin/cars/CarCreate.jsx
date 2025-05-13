import { Create, SimpleForm, TextInput } from 'react-admin';

export const CarCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" />
            <TextInput source="registrationNumber" />
            <TextInput source="carType" />
            <TextInput source="trailerType" />
        </SimpleForm>
    </Create>
);
