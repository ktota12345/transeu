import {
    List,
    Datagrid,
    TextField,
    DateField,
    EditButton,
} from 'react-admin';

const CompanyList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" label="ID" />
            <TextField source="name" label="Nazwa firmy" />
            <DateField source="createdAt" label="Utworzono" showTime />
            <DateField source="updatedAt" label="Zaktualizowano" showTime />
            <EditButton />
        </Datagrid>
    </List>
);

export default CompanyList;
