import { List, Datagrid, TextField, FunctionField, WithRecord, ShowButton, EditButton } from 'react-admin';
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
                rowClick="show"
                expand={<WithRecord label="author" render={record => (<ScheduleExpand schedules={record.schedules}/>)}/>}
                isRowExpandable={(record) => record.schedules?.length > 0}
            >
                <TextField source="id" />
                <TextField source="name" label="Nazwa" />
                <FunctionField
                    label="Przewoźnik"
                    render={(record) =>
                        record.carrier
                            ? record.carrier.name
                            : '—'
                    }
                />
                <TextField source="registrationNumber" label="Nr rejestracyjny" />
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
                <ShowButton/>
            </Datagrid>
        </List>
    );
};

export default CarList;
