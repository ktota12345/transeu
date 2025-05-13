import { List, Datagrid, TextField } from 'react-admin';

const DriverList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" label="Imię" />
            <TextField source="surname" label="Nazwisko" />
            <TextField source="phone" label="Telefon" />
            <TextField source="email" label="Email" />
        </Datagrid>
    </List>
);

export default DriverList;
