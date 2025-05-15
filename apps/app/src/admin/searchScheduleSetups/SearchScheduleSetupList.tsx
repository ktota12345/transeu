import {
    List,
    Datagrid,
    TextField,
    BooleanField,
    FunctionField,
} from 'react-admin';
import { SearchScheduleSetupFilters}  from './SearchScheduleSetupFilter';
import { formatScheduleSummary } from './utils';

const SearchScheduleSetupList = () => (
    <List filters={<SearchScheduleSetupFilters />}>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <TextField source="name" label="Nazwa" />
            <BooleanField source="isDefault" label="Domyślny" />
            <FunctionField
                label="Zakresy dni/godzin"
                render={(record: any) => formatScheduleSummary(record.schedule)}
            />
        </Datagrid>
    </List>
);

export default SearchScheduleSetupList;
