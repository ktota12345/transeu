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

import {dateFormat, formatPrice, googleMapsLink, googleMapsRouteLink} from '../../../data/helpers';
import axiosNest from "../../../api/axiosNest";
import {useState} from "react";
import {useNotify} from "react-admin";

export const OffersTable = ({offers, onSelectOffer, selectedOffer}) => {

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
            notify("Oferta została przypisana", {type: "success"});
        } catch (error) {
            notify("Błąd podczas przypisywania oferty", {type: "error"});
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
                            <TableCell>Ładunek</TableCell>
                            <TableCell>Dystans</TableCell>
                            <TableCell>Załadunek</TableCell>
                            <TableCell>Rozładunek</TableCell>
                            <TableCell>Cena</TableCell>
                            <TableCell>Cena za km</TableCell>
                            <TableCell>Cena za km (brutto)</TableCell>
                            <TableCell>Trasa</TableCell>
                            <TableCell>Oferta</TableCell>
                            <TableCell>Dodaj</TableCell>
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
                                    sx={{cursor: "pointer"}}
                                >
                                    <TableCell>{dateFormat(offer.creationDateTime)}</TableCell>
                                    <TableCell>{offer.sourceSystem || 'timo'}</TableCell>
                                    <TableCell>waga: {offer.weight_t} t
                                        <Typography
                                            variant="body2"
                                            color="textSecondary">
                                            {offer.freightDescription}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}
                                        >{offer.startAccessDistance} + {offer.distance_km}</Typography>
                                        <b>{offer.totalDistance} km</b>
                                    </TableCell>
                                    <TableCell>
                                        {loading?.address.city || '-'}

                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            fontSize={'0.8rem'}
                                            sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}
                                        >
                                            {dateFormat(loading.earliestLoadingDate) || '-'} {loading.startTime || ''}<br/>
                                            {dateFormat(loading.latestLoadingDate) || '-'} {loading.endTime || ''}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {unloading?.address.city || '-'}
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            fontSize={'0.8rem'}
                                            sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}
                                        >
                                            {dateFormat(unloading.earliestLoadingDate) || '-'} {unloading.startTime || ''}<br/>
                                            {dateFormat(unloading.latestLoadingDate) || '-'} {unloading.endTime || ''}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {formatPrice(offer.price.amount, offer.price.currency)}
                                    </TableCell>
                                    <TableCell>{formatPrice(offer.pricePerKmEur, 'EUR')}</TableCell>
                                    <TableCell>{formatPrice(offer.pricePerKmEurGross, 'EUR')}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            href={googleMapsRouteLink([
                                                {lat: offers.car.plannedLocation.address.location[0], lng: offers.car.plannedLocation.address.location[1]},
                                                {lat: loading.address.geoCoordinate.latitude, lng: loading.address.geoCoordinate.longitude},
                                                {lat: unloading.address.geoCoordinate.latitude, lng: unloading.address.geoCoordinate.longitude}
                                            ]
                                        )} target="_blank" rel="noopener noreferrer">Trasa</Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined" size="small" href={offer.deeplink} target="_blank" rel="noopener noreferrer">Oferta</Button>
                                    </TableCell>
                                    <TableCell>
                                        {offer.alreadySaved ? (
                                            <Typography variant="body2" color="textSecondary">Oferta już przypisana</Typography>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleAddOffer(offer)}
                                                disabled={loadingOfferId === offer.id}
                                            >
                                                {loadingOfferId === offer.id ? <CircularProgress size={16}/> : "Dodaj"}
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
