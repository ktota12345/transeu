import { List, Datagrid, TextField } from 'react-admin';

const VehicleBodyList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="apiNameTimocom" />
        </Datagrid>
    </List>
);

export default VehicleBodyList;
