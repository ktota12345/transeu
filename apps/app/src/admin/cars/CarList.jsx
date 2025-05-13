import { List, Datagrid, TextField } from 'react-admin';

const CarList = (props) => (
    <List {...props}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="registrationNumber" label="Nr rejestracyjny" />
            <TextField source="carType" label="Typ samochodu" />
            <TextField source="trailerType" label="Typ naczepy" />
        </Datagrid>
    </List>
);

export default CarList;
