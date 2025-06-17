import {
    List,
    Datagrid,
    TextField,
    DateField,
    EditButton,
    DeleteButton,
    ReferenceField, FunctionField,
} from 'react-admin';
import { roles } from '../../shared/permissions';

const UserList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="email" />
            <TextField source="username" />
            <FunctionField
                label="Rola"
                render={record => roles.find(role => role.id === record.role)?.name || 'Nieznana rola'}
            />
            <ReferenceField source="companyId" reference="companies" emptyText="Brak">
                <TextField source="name" />
            </ReferenceField>
            <DateField source="createdAt" showTime />
            <DateField source="updatedAt" showTime />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export default UserList;
