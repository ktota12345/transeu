import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Paper
} from "@mui/material";

export const OfferMetaTable = ({plannedLocation, plannedLocationDate, furthestCities, loadingCities, unloadingCities}) => (
    <TableContainer component={Paper} sx={{mb: 2}}>
        <Table size="small">
            <TableBody>
                <TableRow>
                    <TableCell><strong>Planowana lokalizacja auta</strong></TableCell>
                    <TableCell>{plannedLocation} ({plannedLocationDate})</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell><strong>Miasta najdalsze (szukanie)</strong></TableCell>
                    <TableCell>{furthestCities}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell><strong>Miasta początkowe (załadunek)</strong></TableCell>
                    <TableCell>{loadingCities.join(', ') || '-'}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell><strong>Miasta docelowe (rozładunek)</strong></TableCell>
                    <TableCell>{unloadingCities.join(', ') || '-'}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </TableContainer>
);
