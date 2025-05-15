import { List, Datagrid, TextField, DateField, FunctionField } from 'react-admin';
import  CarrierFilters from './CarrierFilters';

const CarrierList = () => (
    <List filters={CarrierFilters}>
        <Datagrid rowClick="show">
            <TextField source="id" label="ID" />
            <TextField source="name" label="Nazwa" />
            <TextField source="type" label="Typ" />
            <TextField source="address" label="Adres" />
            <TextField source="postalCode" label="Kod pocztowy" />
            <TextField source="city" label="Miasto" />
            <TextField source="region" label="Województwo" />
            <TextField source="licenseNumber" label="Nr licencji" />
            <DateField source="licenseExpiryDate" label="Ważność licencji" />

            {/* Dane z pierwszego kontaktu */}
            <FunctionField
                label="Telefon"
                render={record => record?.contacts?.[0]?.phone || '-'}
            />
            <FunctionField
                label="Źródło"
                render={record => record?.contacts?.[0]?.source || '-'}
            />
        </Datagrid>
    </List>
);

export default CarrierList;
