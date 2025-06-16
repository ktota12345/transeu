import {
    List,
    Datagrid,
    TextField,
    DateField,
    EditButton,
    DeleteButton,
    ReferenceField,
} from 'react-admin';

const UserList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="email" />
            <TextField source="username" />
            <TextField source="role" />
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
