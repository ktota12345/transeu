import {DateField, useRecordContext} from "react-admin";
import {useState} from "react";
import axiosNest from "../../../api/axiosNest";
import {Button, Card, CardContent, Stack, Typography, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper} from "@mui/material";

export const ScheduleList = () => {
    const record = useRecordContext();
    const [offers, setOffers] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const futureSchedules = (record?.schedules || []).filter(schedule => {
        return new Date(schedule.to) >= new Date();
    });

    const handleSearchOffers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosNest.get(`/offerSearch/car/${record.id}`);
            setOffers(res.data);
        } catch (error) {
            setError("Błąd podczas pobierania ofert.");
            setOffers(null);
        }
        setLoading(false);
    };

    if (!futureSchedules.length) return null;

    const plannedLocation = offers ? offers.car.plannedLocation.address.city || '-' : '-';
    const closeCities = offers ? offers.car.closeCities.map((city)=>city.name) || [] : [];
    const furthestCities = offers ? offers.car.furthestCities.map((city)=>city.name) || [] : [];

    const loadingCities = offers?.offers
        ? [...new Set(offers.offers.map(offer => offer.loadingPlaces.find(lp => lp.loadingType === "LOADING")?.address.city).filter(Boolean))]
        : [];

    const unloadingCities = offers?.offers
        ? [...new Set(offers.offers.map(offer => offer.loadingPlaces.find(lp => lp.loadingType === "UNLOADING")?.address.city).filter(Boolean))]
        : [];

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

                    {error && (
                        <Typography color="error">{error}</Typography>
                    )}

                    {offers && offers.offers && (
                        <>
                            <Typography variant="h6" gutterBottom>Planowana lokalizacja auta: {plannedLocation}</Typography>
                            <Typography variant="h6" gutterBottom>Miasta bliskie (szukanie): {closeCities.join(', ') || '-'}</Typography>
                            <Typography variant="h6" gutterBottom>Miasta najdalsze (szukanie): {furthestCities.join(', ') || '-'}</Typography>

                            <Typography variant="h6" gutterBottom>Miasta początkowe (załadunek): {loadingCities.join(', ') || '-'}</Typography>
                            <Typography variant="h6" gutterBottom>Miasta docelowe (rozładunek): {unloadingCities.join(', ') || '-'}</Typography>

                            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Data</TableCell>
                                            <TableCell>Opis ładunku</TableCell>
                                            <TableCell>Odległość (km)</TableCell>
                                            <TableCell>Waga (t)</TableCell>
                                            <TableCell>Załadunek</TableCell>
                                            <TableCell>Data</TableCell>
                                            <TableCell>Rozładunek</TableCell>
                                            <TableCell>Data</TableCell>
                                            <TableCell>Cena</TableCell>
                                            <TableCell>Link</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {offers.offers.map(offer => {
                                            const loadingCity = offer.loadingPlaces.find(lp => lp.loadingType === "LOADING")?.address.city || '-';
                                            const unloadingCity = offer.loadingPlaces.find(lp => lp.loadingType === "UNLOADING")?.address.city || '-';
                                            const loadingDate = offer.loadingPlaces.find(lp => lp.loadingType === "LOADING")?.earliestLoadingDate || '-';
                                            const unloadingDate = offer.loadingPlaces.find(lp => lp.loadingType === "UNLOADING")?.latestLoadingDate || '-';
                                            return (
                                                <TableRow key={offer.id}>
                                                    <TableCell>{offer.creationDateTime}</TableCell>
                                                    <TableCell>{offer.freightDescription}</TableCell>
                                                    <TableCell>{offer.distance_km}</TableCell>
                                                    <TableCell>{offer.weight_t}</TableCell>
                                                    <TableCell>{loadingCity}</TableCell>
                                                    <TableCell>{loadingDate}</TableCell>
                                                    <TableCell>{unloadingCity}</TableCell>
                                                    <TableCell>{unloadingDate}</TableCell>
                                                    <TableCell>{offer.price ? `${offer.price.amount} ${offer.price.currency}` : 'Brak danych'}</TableCell>
                                                    <TableCell>
                                                        <Link href={offer.deeplink} target="_blank" rel="noopener noreferrer">Zobacz</Link>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}

                    {/* Opcjonalnie nadal możesz wyświetlić JSON */}
                    {offers && (
                        <pre style={{ background: '#f4f4f4', padding: '10px', whiteSpace: 'pre-wrap', overflow:'auto', height:'600px' }}>
                            {JSON.stringify(offers, null, 2)}
                        </pre>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};
