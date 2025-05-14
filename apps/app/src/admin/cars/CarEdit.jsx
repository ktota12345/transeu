import { Edit, SimpleForm, TextInput, ReferenceInput, SelectInput } from 'react-admin';
import {carTypes, trailerTypes} from "../../data/dictOptions";

export const CarEdit = () => (
    <Edit>
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
        </SimpleForm>
    </Edit>
);
