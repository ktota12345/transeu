import {
    Edit,
    SimpleForm,
    TextInput,
    ReferenceInput,
    SelectInput,
    useDataProvider,
    useNotify,
    TextField,
    DateField,
} from 'react-admin';
import React, { useEffect, useState } from 'react';
import { useWatch, useFormContext } from 'react-hook-form';
import {Table, TableHead, TableRow, TableCell, TableBody} from "@mui/material";

const CarScheduleOfferFormContent = () => {
    const { setValue } = useFormContext();
    const dataProvider = useDataProvider();
    const notify = useNotify();

    const carId = useWatch({ name: 'carId' });
    const carScheduleId = useWatch({ name: 'carScheduleId' });

    const [carScheduleFilter, setCarScheduleFilter] = useState({});

    // Filtrowanie harmonogramów po samochodzie
    useEffect(() => {
        if (carId) {
            setCarScheduleFilter({ carId });
        }
    }, [carId]);

    // Auto-ustawienie kierowcy na podstawie harmonogramu
    useEffect(() => {
        if (carScheduleId) {
            dataProvider.getOne('carSchedules', { id: carScheduleId })
                .then(({ data }) => {
                    const driverId = data?.car?.driverId;
                    if (driverId) {
                        setValue('driverId', driverId, { shouldValidate: true });
                    }
                })
                .catch(() => {
                    notify('Błąd podczas pobierania danych harmonogramu', { type: 'warning' });
                });
        }
    }, [carScheduleId, dataProvider, setValue, notify]);

    return (
        <>
            <TextInput source="id" disabled />

            <ReferenceInput
                label="Samochód"
                source="carId"
                reference="cars"
            >
                <SelectInput optionText="name" />
            </ReferenceInput>

            <ReferenceInput
                label="Przypisany slot (CarSchedule)"
                source="carScheduleId"
                reference="carSchedules"
                filter={carScheduleFilter}
            >
                <SelectInput optionText={(choice) =>
                    `${new Date(choice.from).toLocaleDateString()} – ${new Date(choice.to).toLocaleDateString()}`
                } />
            </ReferenceInput>

            <ReferenceInput
                label="Kierowca"
                source="driverId"
                reference="drivers"
                allowEmpty
            >
                <SelectInput optionText={(choice) =>
                    `${choice.name} ${choice.surname}`} />
            </ReferenceInput>

            <SelectInput
                label="Status"
                source="status"
                choices={[
                    { id: 'pending', name: 'Do zatwierdzenia' },
                    { id: 'confirmed', name: 'Zatwierdzona' },
                    { id: 'rejected', name: 'Odrzucona' },
                ]}
            />

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Klucz</TableCell>
                        <TableCell>Wartość</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>Od</TableCell>
                        <TableCell><TextField source="fromDate" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Do</TableCell>
                        <TableCell><TextField source="toDate" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Miejsce początkowe</TableCell>
                        <TableCell><TextField source="fromLocation" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Miejsce docelowe</TableCell>
                        <TableCell><TextField source="toLocation" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Cena</TableCell>
                        <TableCell><TextField source="details.price.amount" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Waluta</TableCell>
                        <TableCell><TextField source="details.price.currency" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Opis ładunku</TableCell>
                        <TableCell><TextField source="details.freightDescription" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Dystans (km)</TableCell>
                        <TableCell><TextField source="details.distance_km" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Typ obiektu</TableCell>
                        <TableCell><TextField source="details.objectType" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Typ pojazdu</TableCell>
                        <TableCell><TextField source="details.vehicleProperties.body" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Typ pojazdu (dodatkowo)</TableCell>
                        <TableCell><TextField source="details.vehicleProperties.type" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Link do oferty</TableCell>
                        <TableCell><TextField source="details.deeplink" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Waga (tony)</TableCell>
                        <TableCell><TextField source="details.weight_t" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Długość (metry)</TableCell>
                        <TableCell><TextField source="details.length_m" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Termin płatności (dni)</TableCell>
                        <TableCell><TextField source="details.paymentDueWithinDays" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Data utworzenia</TableCell>
                        <TableCell><DateField source="createdAt" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Data ostatniej aktualizacji</TableCell>
                        <TableCell><DateField source="updatedAt" /></TableCell>
                    </TableRow>
                </TableBody>
            </Table>

        </>
    );
};

const CarScheduleOfferEdit = () => (
    <Edit title="Powiązanie oferty" mutationMode="pessimistic">
        <SimpleForm>
            <CarScheduleOfferFormContent />
        </SimpleForm>
    </Edit>
);

export default CarScheduleOfferEdit;
