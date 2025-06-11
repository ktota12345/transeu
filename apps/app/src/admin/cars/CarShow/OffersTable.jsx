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

import {dateFormat, formatDistance, formatPrice, getLoadingPlace, getUnloadingPlace, googleMapsLink, googleMapsRouteLink} from '../../../data/helpers';
import axiosNest from "../../../api/axiosNest";
import {useState} from "react";
import {useNotify} from "react-admin";
import PlaceInfoCell from "./PlaceInfoCell";

export const OffersTable = ({offers, onSelectOffer, selectedOffer, fetchAssignedOffers}) => {

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
            fetchAssignedOffers();
        } catch (error) {
            notify("Błąd podczas przypisywania oferty", {type: "error"});
            console.error(error);
        } finally {
            setLoadingOfferId(null);
        }
    };
    const handleRejectOffer = async (offer) => {
        try {
            setLoadingOfferId(offer.id);
            await axiosNest.post(`/car-schedule-offers/${offer.id}/reject`);
            notify("Oferta została odrzucona", {type: "info"});
            fetchAssignedOffers();
        } catch (error) {
            notify("Błąd podczas odrzucania oferty", {type: "error"});
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
                            <TableCell>Cena za km (bez dojazdu)</TableCell>
                            <TableCell>Cena za km</TableCell>
                            <TableCell>Koszty dodatkowe</TableCell>
                            <TableCell>Po korekcie</TableCell>
                            <TableCell>Trasa</TableCell>
                            <TableCell>Oferta</TableCell>
                            <TableCell>Dodaj</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {offers.offers.map((offer) => {
                            const loading = getLoadingPlace(offer);
                            const unloading = getUnloadingPlace(offer);

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
                                        <PlaceInfoCell place={loading} />
                                    </TableCell>
                                    <TableCell>
                                        <PlaceInfoCell place={unloading} />
                                    </TableCell>
                                    <TableCell>
                                        {formatPrice(offer.price.amount, offer.price.currency)}
                                    </TableCell>
                                    <TableCell>{formatPrice(offer.pricePerKmEur, 'EUR')}</TableCell>
                                    <TableCell>{formatPrice(offer.pricePerKmEurGross, 'EUR')}</TableCell>
                                    <TableCell style={{whiteSpace:'nowrap'}}>
                                        {offer.tollCost?.hasNonEuCountries && (
                                            <span>{offer.tollCost?.nonEuCountryCodes.join(', ')}: </span>
                                        )}
                                        {formatPrice(offer.tollCost?.general?.value, 'EUR')} <br />
                                        {offer.tollCost?.hasNonEuCountries && (<Typography style={{whiteSpace:'nowrap'}}>
                                            eu: {formatPrice(offer.tollCost?.eu?.value, 'EUR')}</Typography>)}
                                    </TableCell>
                                    <TableCell>
                                        {formatPrice(offer.pricePerKmEurGrossCorrected, 'EUR')} ({formatDistance(offer.tollCost?.general?.distance)})
                                        { offer.tollCost?.hasNonEuCountries && (<Typography style={{whiteSpace:'nowrap'}}>
                                            {formatPrice(offer.pricePerKmEurGrossCorrectedEuOnly, 'EUR')} ({formatDistance(offer.tollCost?.eu?.distance)})
                                        </Typography>)}
                                    </TableCell>
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
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="error"
                                                onClick={() => handleRejectOffer(offer)}
                                                disabled={loadingOfferId === offer.id}
                                            >
                                                {loadingOfferId === offer.id ? <CircularProgress size={16}/> : "Odrzuć"}
                                            </Button>
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
