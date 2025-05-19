import {
    Edit,
    SimpleForm,
    TextInput,
    ReferenceInput,
    ReferenceArrayInput,
    SelectInput,
    CheckboxGroupInput,
    ArrayInput,
    SimpleFormIterator,
    DateInput,
    SelectArrayInput,
    AutocompleteInput,
} from 'react-admin';
import { trailerTypes,scheduleStatuses } from "../../data/dictOptions";

export const CarEdit = () =>  (
    <Edit mutationMode="pessimistic">
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="name" />
            <TextInput source="registrationNumber" />
            <SelectInput
                source="trailerType"
                choices={trailerTypes.map(type => ({ id: type, name: type }))}
                label="Typ naczepy"
            />
            <ReferenceInput source="driverId" reference="drivers" label="Kierowca">
                <SelectInput optionText={(record) => `${record.name} ${record.surname}`} />
            </ReferenceInput>
            <ReferenceInput source="carrierId" reference="carriers" label="Przewoźnik" allowEmpty>
                <AutocompleteInput optionText="name" />
            </ReferenceInput>

            <ArrayInput source="schedules" label="Harmonogramy">
                <SimpleFormIterator inline>
                    <DateInput source="from" label="Od" defaultValue={new Date()} />
                    <DateInput source="to" label="Do" defaultValue={new Date()} />
                    <SelectInput
                        source="status"
                        choices={scheduleStatuses.map(status => ({ id: status.name, name: status.name }))}
                        label="Status"
                        defaultValue={scheduleStatuses[0].name}
                    />
                </SimpleFormIterator>
            </ArrayInput>

            <ReferenceArrayInput
                source="searchSchedules"
                reference="search-schedule-setup"
                label="Schematy wyszukiwania"
            >
                <CheckboxGroupInput optionText="name" />
            </ReferenceArrayInput>

            {/* Relacje wielu do wielu */}

            <ReferenceArrayInput source="vehicleTypes" reference="vehicle-types" label="Typy pojazdu">
                <CheckboxGroupInput optionText="name" />
            </ReferenceArrayInput>

            <ReferenceArrayInput source="vehicleLoadSecurings" reference="vehicle-load-securing" label="Zabezpieczenia ładunku">
                <CheckboxGroupInput optionText="name" />
            </ReferenceArrayInput>

            <ReferenceArrayInput source="vehicleEquipments" reference="vehicle-equipment" label="Wyposażenie pojazdu">
                <CheckboxGroupInput optionText="name" />
            </ReferenceArrayInput>

            <ReferenceArrayInput source="swapBodies" reference="swap-body" label="Wymienne nadwozia">
                <CheckboxGroupInput optionText="name" />
            </ReferenceArrayInput>

            <ReferenceArrayInput source="bodyProperties" reference="body-property" label="Właściwości nadwozia">
                <CheckboxGroupInput optionText="name" />
            </ReferenceArrayInput>


            <ReferenceArrayInput
                source="searchNotificationSetup.users"
                reference="users"
                label="Użytkownicy powiadamiani"
            >
                <SelectArrayInput optionText={(record) => `${record.username} (${record.email})`} />
            </ReferenceArrayInput>


            <ArrayInput source="searchNotificationSetup.customEmails" label="Dodatkowe adresy e-mail">
                <SimpleFormIterator>
                    <TextInput label="E-mail" />
                </SimpleFormIterator>
            </ArrayInput>

        </SimpleForm>
    </Edit>
);
