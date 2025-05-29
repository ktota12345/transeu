import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Link,
    Typography,
    Button,
    CircularProgress
} from "@mui/material";
import axiosNest from "../../../api/axiosNest";
import {useState} from "react";
import {useNotify} from "react-admin";
import {CarPlanTimeline} from "./CarPlanTimeline";
export const OffersTable = ({ offers, onSelectOffer, selectedOffer }) => {

    const [loadingOfferId, setLoadingOfferId] = useState(null);

    const notify = useNotify();
    if (!offers) return null;

    const loadingCities = [...new Set(
        offers.offers
            .map(o => o.loadingPlaces.find(lp => lp.loadingType === "LOADING")?.address.city)
            .filter(Boolean)
    )];

    const unloadingCities = [...new Set(
        offers.offers
            .map(o => o.loadingPlaces.find(lp => lp.loadingType === "UNLOADING")?.address.city)
            .filter(Boolean)
    )];

    const plannedLocation = offers.car.plannedLocation.address.city || '-';
    const closeCities = offers.car.closeCities.map(c => c.name).join(', ') || '-';
    const furthestCities = offers.car.furthestCities.map(c => c.name).join(', ') || '-';
    const plannedLocationDate = offers.car.plannedLocation.date || '-';


    const handleAddOffer = async (offer) => {
        try {
            setLoadingOfferId(offer.id);

            const payload = {
                details: offer,
                carId: offers.car.carSpecification.carId,
            };

            await axiosNest.post("/car-schedule-offers/assign", payload);
            notify("Oferta została przypisana", { type: "success" });
        } catch (error) {
            notify("Błąd podczas przypisywania oferty", { type: "error" });
            console.error(error);
        } finally {
            setLoadingOfferId(null);
        }
    };


    return (
        <>
            <TableContainer component={Paper} sx={{mb: 2}}>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell><strong>Planowana lokalizacja auta</strong></TableCell>
                            <TableCell>{plannedLocation} ({plannedLocationDate})</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><strong>Miasta bliskie (szukanie)</strong></TableCell>
                            <TableCell>{closeCities}</TableCell>
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


            <Typography variant="h6" gutterBottom>Lista ofert</Typography>

            <TableContainer component={Paper} sx={{maxHeight: 400}}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Data</TableCell>
                            <TableCell>System</TableCell>
                            <TableCell>Opis ładunku</TableCell>
                            <TableCell>Odległość (km)</TableCell>
                            <TableCell>Waga (t)</TableCell>
                            <TableCell>Załadunek</TableCell>
                            <TableCell>Data</TableCell>
                            <TableCell>Rozładunek</TableCell>
                            <TableCell>Data</TableCell>
                            <TableCell>Cena</TableCell>
                            <TableCell>Cena za km</TableCell>
                            <TableCell>Cena za km EUR</TableCell>
                            <TableCell>Cena za km EUR (brutto)</TableCell>
                            <TableCell>Link</TableCell>
                            <TableCell>Dodaj ofertę</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {offers.offers.map((offer) => {
                            const loading = offer.loadingPlaces.find(lp => lp.loadingType === "LOADING");
                            const unloading = offer.loadingPlaces.find(lp => lp.loadingType === "UNLOADING");

                            return (<TableRow
                                    key={offer.id}
                                    hover
                                    selected={selectedOffer?.id === offer.id}
                                    onClick={() => onSelectOffer(offer)}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <TableCell>{offer.creationDateTime}</TableCell>
                                    <TableCell>{offer.sourceSystem || 'timo'}</TableCell>
                                    <TableCell>{offer.freightDescription}</TableCell>
                                    <TableCell>{offer.distance_km} + {offer.startAccessDistance} = {offer.totalDistance}</TableCell>
                                    <TableCell>{offer.weight_t}</TableCell>
                                    <TableCell>{loading?.address.city || '-'}</TableCell>
                                    <TableCell>
                                        {loading.earliestLoadingDate || '-'}
                                        <TableCell>{loading.startTime || ''}</TableCell>
                                        {loading.latestLoadingDate || '-'}
                                        <TableCell>{loading.endTime || ''}</TableCell>
                                    </TableCell>
                                    <TableCell>{unloading?.address.city || '-'}</TableCell>
                                    <TableCell>
                                        {unloading?.earliestLoadingDate || '-'}
                                        <Typography>{unloading?.startTime || ''}</Typography>

                                        {unloading?.latestLoadingDate || '-'}
                                        <Typography>{unloading?.endTime || ''}</Typography>

                                    </TableCell>
                                    <TableCell>{offer.price ? `${offer.price.amount} ${offer.price.currency}` : 'Brak danych'}</TableCell>
                                    <TableCell>{offer.pricePerKm}</TableCell>
                                    <TableCell>{offer.pricePerKmEur}</TableCell>
                                    <TableCell>{offer.pricePerKmEurGross}</TableCell>
                                    <TableCell>
                                        <Link href={offer.deeplink} target="_blank" rel="noopener noreferrer">Zobacz</Link>
                                    </TableCell>
                                    <TableCell>
                                        {offer.alreadySaved ? (
                                            <Typography variant="body2" color="textSecondary">Oferta już przypisana</Typography>
                                        ) : (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleAddOffer(offer)}
                                                disabled={loadingOfferId === offer.id}
                                            >
                                                {loadingOfferId === offer.id ? <CircularProgress size={16}/> : "Dodaj ofertę"}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};
