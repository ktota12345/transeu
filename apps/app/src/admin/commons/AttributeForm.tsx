
import {SimpleForm, TextInput, TextArrayInput} from 'react-admin';
export const AttributeForm = () => (
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="name" />
            <TextInput source="apiNameTimocom" label="API Timocom" />
            <TextArrayInput source="transEuMapping" label="Trans.eu Mapping" />
        </SimpleForm>
);