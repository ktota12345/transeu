import { List, Datagrid, TextField } from 'react-admin';
import { CarFilter } from './CarFilter';  // Importujemy nasz filtr

const CarList = (props) => (
    <List {...props} filters={<CarFilter />}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" label="Nazwa" />
            <TextField source="registrationNumber" label="Nr rejestracyjny" />
            <TextField source="carType" label="Typ samochodu" />
            <TextField source="trailerType" label="Typ naczepy" />
        </Datagrid>
    </List>
);

export default CarList;
