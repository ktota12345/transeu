import {
    Show,
    Edit,
    Create,
    SimpleShowLayout,
    TextField,
    DateField,
    TextInput,
    SimpleForm,
    ArrayInput,
    SimpleFormIterator,
    useRecordContext,
    DateInput,
    SelectInput
} from 'react-admin';
import {Box, Table, TableBody, TableRow, TableCell, Typography} from '@mui/material';
import React from "react";

const carrierTypes = [
    {id: 'Inna osoba prawna', name: 'Inna osoba prawna'},
    {id: 'Przedsiębiorstwo Państwowe', name: 'Przedsiębiorstwo Państwowe'},
    {id: 'Stowarzyszenie', name: 'Stowarzyszenie'},
    {id: 'Spółka z o.o. - spółka komandytowa', name: 'Spółka z o.o. - spółka komandytowa'},
    {id: 'Spółka komandytowa', name: 'Spółka komandytowa'},
    {id: 'Spółka akcyjna', name: 'Spółka akcyjna'},
    {id: 'Spółka jawna', name: 'Spółka jawna'},
    {id: 'Umowa spółki cywilnej', name: 'Umowa spółki cywilnej'},
    {id: 'Spółka z o.o', name: 'Spółka z o.o'},
    {id: 'Spółdzielnia', name: 'Spółdzielnia'},
    {id: 'Spółka komandytowo-akcyjna', name: 'Spółka komandytowo-akcyjna'},
    {id: 'Spółka cywilna', name: 'Spółka cywilna'},
    {id: 'Fundacja', name: 'Fundacja'},
    {id: 'Osoba fizyczna', name: 'Osoba fizyczna'},
];

const JsonDisplay = ({data}: { data: any }) => {
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
                <pre style={{background: '#f5f5f5', padding: '1em', borderRadius: 4}}>
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
                <Box mt={1} style={{width:'calc(100vw - 300px)', height:'500px', overflow:'auto'}}>
                <JsonDisplay data={contact.details}/>
                </Box>
            </Box>
        </Box>
    );
};

const ContactsInput = () => (
    <>
        <Typography variant="h6">Kontakty</Typography>
        <ArrayInput source="contacts" fullWidth>
            <SimpleFormIterator>
                <TextInput source="name" label="Imię i nazwisko"/>
                <TextInput source="phone" label="Telefon"/>
                <TextInput source="email" label="Email"/>
                <TextInput source="source" label="Źródło"/>
            </SimpleFormIterator>
        </ArrayInput>
    </>
);

const CarrierEditFields = () => {

    return (
        <>
            <TextInput source="name" label="Nazwa"/>
            <SelectInput source="type" label="Typ" choices={carrierTypes}/>
            <TextInput source="address" label="Adres"/>
            <TextInput source="postalCode" label="Kod pocztowy"/>
            <TextInput source="city" label="Miasto"/>
            <TextInput source="region" label="Województwo"/>
            <TextInput source="licenseNumber" label="Nr licencji"/>
            <DateInput source="licenseExpiryDate" label="Ważność licencji" defaultValue="{}" />

        </>
    );
}

export const CarrierShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" label="ID"/>
            <TextField source="name" label="Nazwa"/>
            <TextField source="type" label="Typ"/>
            <TextField source="address" label="Adres"/>
            <TextField source="postalCode" label="Kod pocztowy"/>
            <TextField source="city" label="Miasto"/>
            <TextField source="region" label="Województwo"/>
            <TextField source="licenseNumber" label="Nr licencji"/>
            <DateField source="licenseExpiryDate" label="Ważność licencji" />

            <ContactDetailsField/>
        </SimpleShowLayout>
    </Show>
);

export const CarrierEdit = () => (
    <Edit mutationMode="pessimistic">
        <SimpleForm>
            <CarrierEditFields/>
            <ContactDetailsField/>
            <ContactsInput/>
        </SimpleForm>
    </Edit>
);

export const CarrierCreate = () => (
    <Create mutationMode="pessimistic">
        <SimpleForm>
            <CarrierEditFields/>
            <ContactDetailsField/>
            <ContactsInput/>
        </SimpleForm>
    </Create>
);