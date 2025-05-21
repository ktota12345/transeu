import {
    List,
    Datagrid,
    TextField,
    DateField,
    FunctionField,
    ReferenceField,
    ListProps,
} from 'react-admin';
import {CarScheduleOfferFilter} from "./CarScheduleOfferFilter";

const CarScheduleOfferList = (props: ListProps) => (
    <List {...props} filters={<CarScheduleOfferFilter />}>
        <Datagrid rowClick="edit">
            <TextField source="id" />

            <DateField source="fromDate" label="Od" />
            <DateField source="toDate" label="Do" />

            {/* FROM Address */}
            <FunctionField
                label="Skąd"
                render={(record: any) =>
                    record.fromAddress
                        ? `${record.fromAddress.city}, ${record.fromAddress.postalCode}, ${record.fromAddress.country}`
                        : '—'
                }
            />

            {/* TO Address */}
            <FunctionField
                label="Dokąd"
                render={(record: any) =>
                    record.toAddress
                        ? `${record.toAddress.city}, ${record.toAddress.postalCode}, ${record.toAddress.country}`
                        : '—'
                }
            />

            <TextField source="status" label="Status" />

            <ReferenceField source="carId" reference="cars" label="Samochód">
                <FunctionField render={(record: any) => `${record.name} (${record.registrationNumber})`} />
            </ReferenceField>

            <ReferenceField source="driverId" reference="drivers" label="Kierowca">
                <FunctionField render={(record: any) => `${record.name} ${record.surname}`} />
            </ReferenceField>
        </Datagrid>
    </List>
);

export default CarScheduleOfferList;
