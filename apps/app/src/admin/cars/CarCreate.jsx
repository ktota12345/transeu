import { Create, SimpleForm, TextInput, ReferenceInput, SelectInput } from 'react-admin';
import { trailerTypes } from "../../data/dictOptions";

export const CarCreate = () => (
    <Create>
        <SimpleForm>
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
        </SimpleForm>
    </Create>
);
