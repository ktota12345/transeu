import {
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHead,
} from "@mui/material";
import { eachDayOfInterval, parseISO, formatISO } from "date-fns";

export const CarPlanSummary = ({ offers, from, to }) => {
    if (!offers || offers.length === 0 || !from || !to) return null;

    const totalPrice = offers.reduce((acc, o) => acc + (o.details?.price?.amount || 0), 0);
    const totalDistance = offers.reduce((acc, o) => acc + (o.details?.totalDistance || 0), 0);
    const totalStartAccessDistance = offers.reduce((acc, o) => acc + (o.details?.startAccessDistance || 0), 0);
    const avgPricePerKm = totalDistance > 0 ? totalPrice / totalDistance : 0;

    const scheduleStart = new Date(from);
    const scheduleEnd = new Date(to);
    const totalDays = Math.ceil((scheduleEnd - scheduleStart) / (1000 * 60 * 60 * 24)) + 1;

    const workingDaySet = new Set();

    offers.forEach(offer => {
        const fromDate = offer.fromDate;
        const toDate = offer.toDate;
        if (fromDate && toDate) {
            const days = eachDayOfInterval({
                start: parseISO(fromDate),
                end: parseISO(toDate),
            });
            days.forEach(day => workingDaySet.add(formatISO(day, { representation: 'date' })));
        }
    });

    const workingDays = workingDaySet.size;
    const emptyDays = totalDays - workingDays;
    const pricePerDay = totalDays > 0 ? totalPrice / totalDays : 0;
    const accessDistancePercentage = totalDistance > 0 ? (totalStartAccessDistance / totalDistance) * 100 : 0;

    const rows = [
        { label: "Łączna wartość", value: `${totalPrice.toFixed(2)} €` },
        { label: "Łączny dystans", value: `${totalDistance.toFixed(0)} km` },
        { label: "Śr. cena za km", value: `${avgPricePerKm.toFixed(2)} €/km` },
        { label: "Dystans dojazdu", value: `${totalStartAccessDistance.toFixed(0)} km` },
        { label: "Dojazd jako % dystansu", value: `${accessDistancePercentage.toFixed(1)} %` },
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            {rows.map((row, idx) => (
                                <TableCell key={idx} align="center">{row.value}</TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
