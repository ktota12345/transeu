
import {SimpleForm, TextInput} from 'react-admin';
export const AttributeForm = () => (
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="name" />
            <TextInput source="apiNameTimocom" label="API Timocom" />
        </SimpleForm>
);