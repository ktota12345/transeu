import { Edit, SimpleForm, TextInput } from 'react-admin';

const VehicleBodyEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="name" />
            <TextInput source="apiNameTimocom" />
        </SimpleForm>
    </Edit>
);

export default VehicleBodyEdit;
