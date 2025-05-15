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
} from 'react-admin';
import { carTypes, trailerTypes, scheduleStatuses } from "../../data/dictOptions";

export const CarEdit = () => {
    return (
    <Edit mutationMode="pessimistic">
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="name" />
            <TextInput source="registrationNumber" />
            <SelectInput
                source="carType"
                choices={carTypes.map(type => ({ id: type, name: type }))}
                label="Typ samochodu"
            />
            <SelectInput
                source="trailerType"
                choices={trailerTypes.map(type => ({ id: type, name: type }))}
                label="Typ naczepy"
            />
            <ReferenceInput source="driverId" reference="drivers" label="Kierowca">
                <SelectInput optionText={(record) => `${record.name} ${record.surname}`} />
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

        </SimpleForm>
    </Edit>
)};
