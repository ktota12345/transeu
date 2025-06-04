// SwapBodyList.tsx
import {List, Datagrid, TextField, ArrayField, SingleFieldList, FunctionField} from 'react-admin';
import {Chip} from "@mui/material";

const SwapBodyList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" />
            <ArrayField source="transEuMapping" label="Trans.eu Mapping">
                <SingleFieldList>
                    <FunctionField
                        render={item => <Chip label={item} size="small" />}
                    />
                </SingleFieldList>
            </ArrayField>
        </Datagrid>
    </List>
);

export default SwapBodyList;
