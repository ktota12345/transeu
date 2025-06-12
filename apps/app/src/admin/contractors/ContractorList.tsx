import {
    List,
    Datagrid,
    TextField,
    BooleanField,
    FunctionField,
    useRefresh,
    useNotify,
    useUpdate,
    Button, EditButton, ShowButton,
} from 'react-admin';
import ContractorFilters from './ContractorFilters';
import { Stack } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import UndoIcon from '@mui/icons-material/Undo';

const BlacklistButton = ({ record }: { record: any }) => {
    const [update, { isLoading }] = useUpdate();
    const refresh = useRefresh();
    const notify = useNotify();

    const handleToggle = () => {
        update(
            'contractors',
            {
                id: record.id,
                data: {
                    blacklisted: !record.blacklisted,
                    blacklistReason: !record.blacklisted ? 'Manual blacklist from UI' : null,
                },
                meta: { resource: 'contractors/blacklist' },
            },
            {
                onSuccess: () => {
                    notify(`Kontrahent został ${record.blacklisted ? 'odblokowany' : 'zablokowany'}`, {
                        type: 'info',
                    });
                    refresh();
                },
                onError: (error) => {
                    notify(`Błąd: ${error.message}`, { type: 'warning' });
                },
            }
        );
    };

    return (
        <Button
            label={record.blacklisted ? 'Odblokuj' : 'Zablokuj'}
            onClick={handleToggle}
            disabled={isLoading}
        >
            {record.blacklisted ? <UndoIcon /> : <BlockIcon />}
        </Button>
    );
};

const ContractorList = () => (
    <List filters={ContractorFilters}>
        <Datagrid rowClick={false}>
            <TextField source="id" label="ID" />
            <TextField source="legalName" label="Nazwa formalna" />
            <TextField source="city" label="Miasto" />
            <TextField source="country" label="Kraj" />
            <BooleanField source="blacklisted" label="Czarna lista" />
            <TextField source="blacklistReason" label="Powód blokady" />

            {/* Przycisk do blacklisty */}
            <FunctionField
                label="Akcje"
                render={record => <BlacklistButton record={record} />}
            />

            <EditButton/>
        </Datagrid>
    </List>
);

export default ContractorList;
