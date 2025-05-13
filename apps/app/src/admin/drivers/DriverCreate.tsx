import { Create, SimpleForm, TextInput } from 'react-admin';

const DriverCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" label="Imię" />
            <TextInput source="surname" label="Nazwisko" />
            <TextInput source="phone" label="Telefon" />
            <TextInput source="email" label="Email" />
        </SimpleForm>
    </Create>
);

export default DriverCreate;
