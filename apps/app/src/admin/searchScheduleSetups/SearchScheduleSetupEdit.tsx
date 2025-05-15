import {
    Edit,
    SimpleForm,
    TextInput,
    BooleanInput,
    ArrayInput,
    SimpleFormIterator,
    SelectInput,
    TimeInput,
} from 'react-admin';
import { daysOfWeek } from '../../data/dictOptions';
import { preprocessScheduleForEdit, transformScheduleOnSave } from './utils';

const SearchScheduleSetupEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="name" label="Nazwa" fullWidth />
            <BooleanInput source="isDefault" label="Domyślny" />

            <ArrayInput
                source="schedule"
                label="Zakresy godzin"
                format={preprocessScheduleForEdit}
                parse={transformScheduleOnSave}
            >
                <SimpleFormIterator>
                    <SelectInput source="day" choices={daysOfWeek} label="Dzień" />
                    <ArrayInput source="hours" label="Godziny">
                        <SimpleFormIterator>
                            <TimeInput source="" label="Godzina" />
                        </SimpleFormIterator>
                    </ArrayInput>
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Edit>
);

export default SearchScheduleSetupEdit;
