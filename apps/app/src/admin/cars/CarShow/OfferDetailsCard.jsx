import {Box, Card, CardContent, Grid, TableCell, Typography} from "@mui/material";
import {formatPrice, getLoadingPlace, getUnloadingPlace, googleMapsRouteLink} from "../../../data/helpers";
import PlaceInfoCell from "./PlaceInfoCell";
import { Button } from "react-admin";
import { OFFER_STATUSES } from "./Timeline/constants";

export const OfferDetailsCard = ({ offer, onChangeStatus, onSearchFromUnloading, onDelete  }) => {
    if (!offer) return null;
    const details = offer.details || {};

    const loading = getLoadingPlace(details);
    const unloading = getUnloadingPlace(details);

    return (
        <Card sx={{ mt: 2 }}>
            <CardContent>
                <Grid container spacing={2} alignItems="flex-start">
                    <Box><PlaceInfoCell place={loading} /></Box>
                    <Box>→</Box>
                    <Box><PlaceInfoCell place={unloading} />

                        <Button
                            size="small"
                            variant="outlined"
                            onClick={onSearchFromUnloading}
                        >
                            Szukaj z tego miejsca
                        </Button>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="textSecondary">
                            waga: {details.weight_t || "Brak danych"} t<br />
                            {details.freightDescription || "Brak opisu"}
                        </Typography>
                    </Box>
                    <Box><Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}
                    >{offer.details.startAccessDistance} + {offer.details.distance_km}</Typography>
                        <b>{offer.details.totalDistance} km</b>
                    </Box>
                    <Box>

                        {formatPrice(offer.details.price.amount, offer.details.price.currency)}<br/>
                        {formatPrice(offer.details.pricePerKmEur, 'EUR')}<br/>
                        <b>{formatPrice(offer.details.pricePerKmEurGross, 'EUR')}</b>
                    </Box>
                    <Box>
                        <Button
                            variant="outlined"
                            size="small"
                            href={offer.details.deeplink}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Oferta
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            href={googleMapsRouteLink([
                                {lat: loading.address.geoCoordinate.latitude, lng: loading.address.geoCoordinate.longitude},
                                {lat: unloading.address.geoCoordinate.latitude, lng: unloading.address.geoCoordinate.longitude}
                            ])}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Trasa
                        </Button>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1}>
                        {OFFER_STATUSES.map(({ value, label }) => (
                            <Button
                                key={value}
                                size="small"
                                variant="contained"
                                disabled={offer.status === value}
                                onClick={() => onChangeStatus(value)}
                            >
                                {label}
                            </Button>
                        ))}
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={onDelete}
                        >
                            Usuń
                        </Button>
                    </Box>
                </Grid>
            </CardContent>
        </Card>
    );
};
