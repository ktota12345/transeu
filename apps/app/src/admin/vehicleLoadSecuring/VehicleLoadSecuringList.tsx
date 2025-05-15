// VehicleLoadSecuringList.tsx
import { List, Datagrid, TextField } from 'react-admin';

const VehicleLoadSecuringList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="apiNameTimocom" label="API Timocom" />
        </Datagrid>
    </List>
);

export default VehicleLoadSecuringList;
