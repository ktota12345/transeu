import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    FunctionField,
    useRecordContext
} from 'react-admin';
import { Box, Table, TableBody, TableRow, TableCell, Typography } from '@mui/material';

const JsonDisplay = ({ data }: { data: any }) => {
    if (!data || typeof data !== 'object') return null;

    // Jeżeli dane są zbyt głęboko zagnieżdżone lub mają złożoną strukturę, pokaż jako sformatowany JSON
    const isDeepOrComplex = (obj: any): boolean => {
        const depth = (o: any, level = 0): number =>
            o && typeof o === 'object'
                ? Math.max(...Object.values(o).map(v => depth(v, level + 1)), level)
                : level;
        return depth(obj) > 2;
    };

    if (isDeepOrComplex(data)) {
        return (
            <Box mt={2}>
                <Typography variant="subtitle2">Szczegóły (JSON)</Typography>
                <pre style={{ background: '#f5f5f5', padding: '1em', borderRadius: 4 }}>
                    {JSON.stringify(data, null, 2)}
                </pre>
            </Box>
        );
    }

    return (
        <Box mt={2}>
            <Typography variant="subtitle2">Szczegóły</Typography>
            <Table size="small">
                <TableBody>
                    {Object.entries(data).map(([key, value]) => (
                        <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>{String(value)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
};

const ContactDetailsField = () => {
    const record = useRecordContext();
    const contact = record?.contacts?.[0];

    if (!contact) return null;

    return (
        <Box mt={2}>
            <Typography variant="h6">Kontakt</Typography>
            <Box ml={1}>
                <Typography variant="body2"><strong>Imię i nazwisko:</strong> {contact.name || '-'}</Typography>
                <Typography variant="body2"><strong>Telefon:</strong> {contact.phone || '-'}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {contact.email || '-'}</Typography>
                <Typography variant="body2"><strong>Źródło:</strong> {contact.source || '-'}</Typography>
                <JsonDisplay data={contact.details} />
            </Box>
        </Box>
    );
};

const CarrierShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" label="ID" />
            <TextField source="name" label="Nazwa" />
            <TextField source="type" label="Typ" />
            <TextField source="address" label="Adres" />
            <TextField source="postalCode" label="Kod pocztowy" />
            <TextField source="city" label="Miasto" />
            <TextField source="region" label="Województwo" />
            <TextField source="licenseNumber" label="Nr licencji" />
            <DateField source="licenseExpiryDate" label="Ważność licencji" />

            <ContactDetailsField />
        </SimpleShowLayout>
    </Show>
);

export default CarrierShow;
