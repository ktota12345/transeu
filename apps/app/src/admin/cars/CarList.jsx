import { List, Datagrid, TextField, FunctionField, WithRecord, EditButton } from 'react-admin';
import { CarFilter } from './CarFilter';  // Importujemy nasz filtr
import { useState } from 'react';
import ScheduleExpand from './ScheduleExpand';  // Komponent do rozwijania harmonogramów

const CarList = (props) => {
    const [expandedRows, setExpandedRows] = useState([]);

    const handleExpandClick = (rowId) => {
        setExpandedRows((prev) =>
            prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
        );
    };

    return (
        <List {...props} filters={<CarFilter />}>
            <Datagrid
                rowClick="expand"
                expand={<WithRecord label="author" render={record => (<ScheduleExpand schedules={record.schedules}/>)}/>}
                isRowExpandable={(record) => record.schedules?.length > 0}
            >
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
                <EditButton/>
            </Datagrid>
        </List>
    );
};

export default CarList;
