import {Card, CardContent, Typography} from "@mui/material";
import {ChipField, ReferenceArrayField,  SingleFieldList,  useRecordContext
} from "react-admin";

const CustomEmailList = () => {
    const record = useRecordContext();
    const emails = record?.searchNotificationSetup?.customEmails || [];

    return (
        <>
            {emails.map((email, idx) => (
                <span key={idx}>{email}, </span>
            ))}
        </>
    );
};
export const Additional = () => (
    <Card sx={{ height: '100%', width: '100%' }}>
    <CardContent>
        <Typography variant="h6">Opcje dodatkowe</Typography>
        <ReferenceArrayField source="searchSchedules" reference="search-schedule-setup" label="Schematy wyszukiwania">
            <SingleFieldList><ChipField source="name" /></SingleFieldList>
        </ReferenceArrayField>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>Użytkownicy powiadamiani</Typography>
        <ReferenceArrayField source="searchNotificationSetup.users" reference="users">
            <SingleFieldList>
                <ChipField source="email" />
            </SingleFieldList>
        </ReferenceArrayField>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>Dodatkowe adresy e-mail</Typography>
        <CustomEmailList />
    </CardContent>
</Card>
);