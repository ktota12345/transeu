// BodyPropertyList.tsx
import { List, Datagrid, TextField } from 'react-admin';

const BodyPropertyList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" />
        </Datagrid>
    </List>
);

export default BodyPropertyList;
