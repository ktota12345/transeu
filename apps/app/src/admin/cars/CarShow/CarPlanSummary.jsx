import { Card, CardContent, Typography, Table, TableBody, TableCell, TableRow, TableHead, Button } from "@mui/material";

// Funkcja Google Maps bez zmian
const googleMapsRouteLink = (points) => {
    if (!Array.isArray(points) || points.length < 2) return '#';
    const isValidCoord = (c) => c && !isNaN(c.lat) && !isNaN(c.lng);
    if (!points.every(isValidCoord)) return '#';

    const origin = `${points[0].lat},${points[0].lng}`;
    const destination = `${points[points.length - 1].lat},${points[points.length - 1].lng}`;
    const waypoints = points.slice(1, -1).map(p => `${p.lat},${p.lng}`).join('|');

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    if (waypoints) url += `&waypoints=${waypoints}`;
    return url;
};

export const CarPlanSummary = ({ offers, from, to, baseAddress }) => {
    if (!offers || offers.length === 0 || !from || !to) return null;

    const totalPrice = offers.reduce((acc, o) => acc + (o.details?.price?.amount || 0), 0);
    const totalDistance = offers.reduce((acc, o) => acc + (o.details?.totalDistance || 0), 0);
    const totalStartAccessDistance = offers.reduce((acc, o) => acc + (o.details?.startAccessDistance || 0), 0);
    const avgPricePerKm = totalDistance > 0 ? totalPrice / totalDistance : 0;

    const scheduleStart = new Date(from);
    const scheduleEnd = new Date(to);
    const totalDays = Math.ceil((scheduleEnd - scheduleStart) / (1000 * 60 * 60 * 24)) + 1;

    const occupiedDaySet = new Set();
    offers.forEach(o => {
        const start = new Date(o.fromDate);
        const end = new Date(o.toDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            occupiedDaySet.add(d.toISOString().split('T')[0]);
        }
    });

    const workingDays = occupiedDaySet.size;
    const emptyDays = totalDays - workingDays;
    const pricePerDay = totalDays > 0 ? totalPrice / totalDays : 0;
    const accessDistancePercent = totalDistance > 0 ? (totalStartAccessDistance / totalDistance) * 100 : 0;

    const baseCoords = baseAddress?.latitude && baseAddress?.longitude
        ? { lat: baseAddress.latitude, lng: baseAddress.longitude }
        : null;

    const offerCoords = offers.flatMap(o =>
        o.details?.loadingPlaces?.map(lp => ({
            lat: lp.address?.geoCoordinate?.latitude,
            lng: lp.address?.geoCoordinate?.longitude
        })) || []
    ).filter(coord => coord?.lat && coord?.lng);

    const coordinates = baseCoords
        ? [baseCoords, ...offerCoords]
        : offerCoords;

    const googleMapsUrl = googleMapsRouteLink(coordinates);

    const rows = [
        { label: "Łączna wartość", value: `${totalPrice.toFixed(2)} €` },
        { label: "Łączny dystans", value: `${totalDistance.toFixed(0)} km` },
        { label: "Śr. cena za km", value: `${avgPricePerKm.toFixed(2)} €/km` },
        { label: "Dystans dojazdu", value: `${totalStartAccessDistance.toFixed(0)} km` },
        { label: "Dojazd jako % dystansu", value: `${accessDistancePercent.toFixed(1)} %` },
        { label: "Dni robocze", value: `${workingDays}` },
        { label: "Dni puste", value: `${emptyDays}` },
        { label: "Śr. cena za dzień", value: `${pricePerDay.toFixed(2)} €/dzień` },
    ];

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>Podsumowanie trasy</Typography>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {rows.map((row, idx) => (
                                <TableCell key={idx} align="center"><strong>{row.label}</strong></TableCell>
                            ))}
                            <TableCell align="center"><strong>Akcja</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            {rows.map((row, idx) => (
                                <TableCell key={idx} align="center">{row.value}</TableCell>
                            ))}
                            <TableCell>
                                {coordinates.length >= 2 && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        href={googleMapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Pokaż trasę
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
