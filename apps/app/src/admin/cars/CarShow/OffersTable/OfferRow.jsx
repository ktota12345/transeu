import {dateFormat, formatPrice, getLoadingPlace, getUnloadingPlace, formatDistance, googleMapsRouteLink} from "../../../../data/helpers";
import {Fragment, useState} from "react";
import {
    TableRow,
    TableCell,
    Typography,
    Button,
    CircularProgress
} from "@mui/material";
import PlaceInfoCell from "../PlaceInfoCell";
import {Link, useNotify} from "react-admin";
import axiosNest     from "../../../../api/axiosNest";

export const OfferRow = ({
                             offer,
                             selectedOffer,
                             onSelectOffer,
                             loadingOfferId,
                             handleAddOffer,
                             handleRejectOffer,
                             carPlannedLocation,
                             onUpdateOffer
                         }) => {

    const [addingContractor, setAddingContractor] = useState(false);
    const [contractorAdded, setContractorAdded] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const loading = getLoadingPlace(offer);
    const unloading = getUnloadingPlace(offer);
    const notify = useNotify();

    const addContractor = async (offerPublisher) => {
        if (!offerPublisher) return;

        const dataToSend = {
            legalName: offerPublisher.name || "",
            taxId: offerPublisher.taxId || "",
            address: offerPublisher.companyAddress?.streetOrPostbox || "",
            postalCode: offerPublisher.companyAddress?.postalCode || "",
            city: offerPublisher.companyAddress?.city || "",
            country: offerPublisher.companyAddress?.country || "",
            blacklisted: offerPublisher.isBlackListed || false,
            blacklistReason: offerPublisher.blacklistReason || ""
        };

        try {
            setAddingContractor(true);
            await axiosNest.post('/contractors', dataToSend);
            setContractorAdded(true);
        } catch (error) {
            if(error?.response?.data?.message) {
                notify(error.response.data.message, {type: "error"});
            }else{
                notify("Błąd podczas dodawania kontrahenta", {type: "error"});
                console.error("Error adding contractor:", error);
            }
            setContractorAdded(false);
        } finally {
            setAddingContractor(false);
        }
    };

    const loadOfferDetails = async (offerId, sourceSystem) => {
        const system = sourceSystem??'timo';
        if (!offerId || !system) return;
        setLoadingDetails(true);

        try {
            const response = await axiosNest.get(`/offerSearch/details/${offerId}/${system}`);
            const updatedOffer = response.data;
            console.log(updatedOffer);

            onUpdateOffer(offerId, updatedOffer);

        } catch (error) {
            notify("Nie udało się pobrać szczegółów oferty", {type: "error"});
            console.error("Error loading offer details:", error);
        } finally {
            setLoadingDetails(false);
        }
    };



    return (
        <Fragment key={offer.id}>
            <TableRow
                hover
                selected={selectedOffer?.id === offer.id}
                onClick={() => onSelectOffer(offer)}
                sx={{cursor: "pointer"}}
            >
                <TableCell>{dateFormat(offer.creationDateTime)}</TableCell>
                <TableCell>
                    <Typography variant="body2" color="textSecondary" sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {offer.startAccessDistance} + {offer.distance_km}
                    </Typography>
                    <b>{offer.totalDistance} km</b>
                </TableCell>
                <TableCell><PlaceInfoCell place={loading}/></TableCell>
                <TableCell><PlaceInfoCell place={unloading}/></TableCell>
                <TableCell>{formatPrice(offer.price.amount, offer.price.currency)}</TableCell>
                <TableCell>{formatPrice(offer.pricePerKmEur, 'EUR')}</TableCell>
                <TableCell>{formatPrice(offer.pricePerKmEurGross, 'EUR')}</TableCell>
                <TableCell style={{whiteSpace: 'nowrap'}}>
                    {offer.tollCost?.hasNonEuCountries && (
                        <span>{offer.tollCost?.nonEuCountryCodes.join(', ')}: </span>
                    )}
                    {formatPrice(offer.tollCost?.general?.value, 'EUR')} <br/>
                    {offer.tollCost?.hasNonEuCountries && (
                        <Typography style={{whiteSpace: 'nowrap'}}>
                            EU: {formatPrice(offer.tollCost?.eu?.value, 'EUR')}
                        </Typography>
                    )}
                </TableCell>
                <TableCell>
                    {formatPrice(offer.pricePerKmEurGrossCorrected, 'EUR')} ({formatDistance(offer.tollCost?.general?.distance)})
                    {offer.tollCost?.hasNonEuCountries && (
                        <Typography style={{whiteSpace: 'nowrap'}}>
                            {formatPrice(offer.pricePerKmEurGrossCorrectedEuOnly, 'EUR')} ({formatDistance(offer.tollCost?.eu?.distance)})
                        </Typography>
                    )}
                </TableCell>
                <TableCell>
                    {offer.alreadySaved ? (
                        <Button variant="outlined" size="small" color="error" onClick={() => handleRejectOffer(offer)} disabled={loadingOfferId === offer.id}>
                            {loadingOfferId === offer.id ? <CircularProgress size={16}/> : "Odrzuć"}
                        </Button>
                    ) : (
                        <Button variant="contained" size="small" onClick={() => handleAddOffer(offer)} disabled={loadingOfferId === offer.id}>
                            {loadingOfferId === offer.id ? <CircularProgress size={16}/> : "Dodaj"}
                        </Button>
                    )}
                </TableCell>
            </TableRow>
            <TableRow
                style={{
                    backgroundColor: selectedOffer?.id === offer.id ? '#f5f5f5' : 'inherit',
                    borderTop: 0,
                }}
                selected={selectedOffer?.id === offer.id}
            >
                <TableCell colSpan={2} style={{borderBottom:'2px solid #000000'}}>
                    {offer.sourceSystem || 'timo'}, waga: {offer.weight_t} t
                    <Typography variant="body2" color="textSecondary">{offer.freightDescription}</Typography>
                </TableCell>
                <TableCell colSpan={2} style={{borderBottom:'2px solid #000000'}}>
                    {offer.offerPublisher?.name || 'N/A'}, {offer.offerPublisher?.taxId || ''} <br/>
                    {offer.offerPublisher?.phone || ''}

                    {offer.offerPublisher?.rating_summary && (
                        <Typography variant="body2" color="textSecondary">
                            Ocena: {offer.offerPublisher.rating_summary.rating_average} ({offer.offerPublisher.rating_summary.ratings_sender_companies_count} ocen)
                        </Typography>
                    )}

                    {offer.offerPublisher?.trans_risk && (
                        <Typography variant="body2" color="textSecondary">
                            TransRisk: {offer.offerPublisher.trans_risk.rating} ({offer.offerPublisher.trans_risk.description}, {offer.offerPublisher.trans_risk.score} pkt)
                        </Typography>
                    )}
                </TableCell>
                <TableCell colSpan={4} style={{borderBottom:'2px solid #000000'}}>
                    {offer?.offerPublisher?.isBlackListed && (
                        <Typography variant="body2" color="error">
                            ⚠️ Firma znajduje się na czarnej liście!
                        </Typography>
                    )}
                    {offer.offerPublisher?.taxId ? (
                        <>
                    {offer?.offerPublisher?.contractorId ? (
                        <Link to={`/admin/contractors/${offer.offerPublisher.contractorId}`} target="_blank" rel="noopener noreferrer">
                            zobacz
                        </Link>
                    ) : (
                        contractorAdded ? (
                            <Typography variant="body2" color="success.main">Dodano</Typography>
                        ) : (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => addContractor(offer?.offerPublisher)}
                                disabled={addingContractor}
                            >
                                {addingContractor ? "Dodawanie..." : "Dodaj kontrahenta"}
                            </Button>
                        )
                    )}
                    </>) : (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => loadOfferDetails(offer?.id, offer.sourceSystem)}
                            disabled={loadingDetails}
                        >
                            {loadingDetails ? "Wyczytywanie..." : "Wczytaj szczegóły"}
                        </Button>

                    )}


                </TableCell>

                <TableCell colSpan={2} align="right"  style={{borderBottom:'2px solid #000000'}}>
                    <Button
                        style={{marginRight: 8}}
                        variant="outlined"
                        size="small"
                        href={googleMapsRouteLink([
                            {lat: carPlannedLocation[0], lng: carPlannedLocation[1]},
                            {lat: loading.address.geoCoordinate.latitude, lng: loading.address.geoCoordinate.longitude},
                            {lat: unloading.address.geoCoordinate.latitude, lng: unloading.address.geoCoordinate.longitude}
                        ])}
                        target="_blank" rel="noopener noreferrer"
                    >Trasa</Button>
                    <Button
                        variant="outlined" size="small" href={offer.deeplink} target="_blank" rel="noopener noreferrer">Oferta</Button>
                </TableCell>
            </TableRow>
        </Fragment>
    );
};
