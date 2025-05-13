import { List, Datagrid, TextField, FunctionField  } from 'react-admin';
import { CarFilter } from './CarFilter';  // Importujemy nasz filtr

const CarList = (props) => (
    <List {...props} filters={<CarFilter />}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" label="Nazwa" />
            <TextField source="registrationNumber" label="Nr rejestracyjny" />
            <TextField source="carType" label="Typ samochodu" />
            <TextField source="trailerType" label="Typ naczepy" />
            <FunctionField
                label="Kierowca"
                render={(record) =>
                    record.driver
                        ? `${record.driver.name} ${record.driver.surname}`
                        : '—'
                }
            />
        </Datagrid>
    </List>
);

export default CarList;
