// SwapBodyList.tsx
import { List, Datagrid, TextField } from 'react-admin';

const SwapBodyList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" />
        </Datagrid>
    </List>
);

export default SwapBodyList;
