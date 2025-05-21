import {DateField, useRecordContext} from "react-admin";
import {useState} from "react";
import axiosNest from "../../../api/axiosNest";
import {
    Button,
    Card,
    CardContent,
    Stack,
    Typography
} from "@mui/material";
import {SearchParameters} from "./SearchParameters";
import {OffersTable} from "./OffersTable";

export const ScheduleList = () => {
    const record = useRecordContext();
    const [offers, setOffers] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [numLoadingCities, setNumLoadingCities] = useState(3);
    const [numUnloadingCities, setNumUnloadingCities] = useState(10);
    const [searchArea, setSearchArea] = useState(50);
    const [perPage, setPerPage] = useState(100);

    const futureSchedules = (record?.schedules || []).filter(schedule => {
        return new Date(schedule.to) >= new Date();
    });

    const handleSearchOffers = async () => {
        setLoading(true);
        setError(null);
        setOffers(null);
        try {
            const params = {
                numLoadingCities,
                numUnloadingCities,
                searchArea,
                perPage,
            };

            const res = await axiosNest.get(`/offerSearch/car/${record.id}`, {params});
            setOffers(res.data);
        } catch (error) {
            setError("Błąd podczas pobierania ofert.");
            setOffers(null);
        }
        setLoading(false);
    };

    if (!futureSchedules.length) return null;

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>Harmonogramy (aktywne okresy okresy)</Typography>
                <Stack spacing={2}>
                    {futureSchedules.map((s, idx) => (
                        <Stack key={idx} direction="row" spacing={2}>
                            <Typography>Od: <DateField record={s} source="from"/></Typography>
                            <Typography>Do: <DateField record={s} source="to"/></Typography>
                            <Typography>Status: {s.status}</Typography>
                        </Stack>
                    ))}

                    <SearchParameters
                        numLoadingCities={numLoadingCities}
                        setNumLoadingCities={setNumLoadingCities}
                        numUnloadingCities={numUnloadingCities}
                        setNumUnloadingCities={setNumUnloadingCities}
                        searchArea={searchArea}
                        setSearchArea={setSearchArea}
                        perPage={perPage}
                        setPerPage={setPerPage}
                    />

                    <Button variant="contained" onClick={handleSearchOffers} disabled={loading}>
                        {loading ? 'Szukam...' : 'Szukaj ofert'}
                    </Button>

                    {error && <Typography color="error">{error}</Typography>}

                    {offers && offers.offers && <OffersTable offers={offers} />}

                    {offers && (
                        <pre style={{background: '#f4f4f4', padding: '10px', whiteSpace: 'pre-wrap', overflow: 'auto', height: '600px'}}>
                            {JSON.stringify(offers, null, 2)}
                        </pre>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};
