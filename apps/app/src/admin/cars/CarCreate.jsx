import { Create, SimpleForm, TextInput, ReferenceInput, SelectInput } from 'react-admin';

export const CarCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" />
            <TextInput source="registrationNumber" />
            <TextInput source="carType" />
            <TextInput source="trailerType" />
            <ReferenceInput source="driverId" reference="drivers" label="Kierowca">
                <SelectInput optionText={(record) => `${record.name} ${record.surname}`} />
            </ReferenceInput>
        </SimpleForm>
    </Create>
);
