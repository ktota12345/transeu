import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
} from "@mui/material";
import axiosNest from "../../../api/axiosNest";
import {Fragment, useState} from "react";
import {useNotify} from "react-admin";
import {OfferMetaTable} from "./OfferMetaTable";
import {OfferRow} from "./OffersTable/OfferRow";

export const OffersTable = ({offers, onSelectOffer, selectedOffer, fetchAssignedOffers, setOffers}) => {

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
    const handleUpdateOffer = (offerId, updatedOffer) => {
        setOffers(prevOffers => {
                return {
                    ...prevOffers,
                    offers: prevOffers.offers.map(offer => offer.id === offerId ? updatedOffer : offer)
                }
            }
        );
    };


    return (
        <>
            <OfferMetaTable
                plannedLocation={plannedLocation}
                plannedLocationDate={plannedLocationDate}
                furthestCities={furthestCities}
                loadingCities={loadingCities}
                unloadingCities={unloadingCities}
            />


            <Typography variant="h6" gutterBottom>Lista ofert</Typography>

            <TableContainer component={Paper} sx={{maxHeight: 400}}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Data</TableCell>
                            <TableCell>Dystans</TableCell>
                            <TableCell>Załadunek</TableCell>
                            <TableCell>Rozładunek</TableCell>
                            <TableCell>Cena</TableCell>
                            <TableCell>Cena za km (bez dojazdu)</TableCell>
                            <TableCell>Cena za km</TableCell>
                            <TableCell>Koszty dodatkowe</TableCell>
                            <TableCell>Po korekcie</TableCell>
                            <TableCell>Akcja</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {offers.offers.map((offer) => {

                            return (

                                    <OfferRow
                                        key={offer.id}
                                        offer={offer}
                                        selectedOffer={selectedOffer}
                                        onSelectOffer={onSelectOffer}
                                        loadingOfferId={loadingOfferId}
                                        handleAddOffer={handleAddOffer}
                                        handleRejectOffer={handleRejectOffer}
                                        carPlannedLocation={offers.car.plannedLocation.address.location}
                                        onUpdateOffer={handleUpdateOffer}
                                    />
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};
