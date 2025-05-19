import {DateField, useRecordContext} from "react-admin";
import {useState} from "react";
import axiosNest     from "../../../api/axiosNest";
import {Button, Card, CardContent, Stack, Typography} from "@mui/material";

export const ScheduleList = () => {
    const record = useRecordContext();
    const [offers, setOffers] = useState('');
    const [loading, setLoading] = useState(false);

    const futureSchedules = (record?.schedules || []).filter(schedule => {
        return new Date(schedule.to) >= new Date();
    });

    const handleSearchOffers = async () => {
        setLoading(true);
        try {
            const res = await axiosNest.get(`/offerSearch/car/${record.id}`);
            setOffers(JSON.stringify(res.data, null, 2));
        } catch (error) {
            setOffers("Błąd podczas pobierania ofert.");
        }
        setLoading(false);
    };

    if (!futureSchedules.length) return null;

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>Harmonogramy (aktywny okres)</Typography>
                <Stack spacing={2}>
                    {futureSchedules.map((s, idx) => (
                        <Stack key={idx} direction="row" spacing={2}>
                            <Typography>Od: <DateField record={s} source="from" /></Typography>
                            <Typography>Do: <DateField record={s} source="to" /></Typography>
                            <Typography>Status: {s.status}</Typography>
                        </Stack>
                    ))}
                    <Button variant="contained" onClick={handleSearchOffers} disabled={loading}>
                        {loading ? 'Szukam...' : 'Szukaj ofert'}
                    </Button>
                    {offers && (
                        <pre style={{ background: '#f4f4f4', padding: '10px', whiteSpace: 'pre-wrap' }}>
                            {offers}
                        </pre>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};