// VehicleLoadSecuringList.tsx
import {List, Datagrid, TextField, ArrayField, SingleFieldList, FunctionField} from 'react-admin';
import {Chip} from "@mui/material";

const VehicleLoadSecuringList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="apiNameTimocom" label="API Timocom" />
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

export default VehicleLoadSecuringList;
