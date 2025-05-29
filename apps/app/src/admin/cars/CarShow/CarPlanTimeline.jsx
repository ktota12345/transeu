import {Card, CardContent, Typography, Grid} from "@mui/material";
import {TimelineBar} from "./Timeline/TimelineBar";
import {format} from "date-fns";

export const CarPlanTimeline = ({
                                    from,
                                    to,
                                    startCity = "Nieznane",
                                    assignedOffers = [],
                                    currentOffer = null,
                                    selectedOfferId,
                                    onSelectOffer
                                }) => {
    if (!from || !to) return null;

    const totalDays = Math.round((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24));


    const mappedOffers = assignedOffers.map((offer) => {

        const loadingPlace = offer.details.loadingPlaces.find(lp => lp.loadingType === "LOADING");
        const unloadingPlace = offer.details.loadingPlaces.find(lp => lp.loadingType === "UNLOADING");


        const fromDate = loadingPlace?.earliestLoadingDate ? new Date(loadingPlace.earliestLoadingDate + "T" + (loadingPlace.startTime || "07:00:00")) : null;
        const toDate = unloadingPlace?.latestLoadingDate ? new Date(unloadingPlace.latestLoadingDate + "T" + (unloadingPlace.endTime || "17:00:00")) : null;

        const latestFrom = loadingPlace?.latestLoadingDate ? new Date(loadingPlace.latestLoadingDate + "T" + (loadingPlace.endTime || "17:00:00")) : null;
        const earliestTo = unloadingPlace?.earliestLoadingDate ? new Date(unloadingPlace.earliestLoadingDate + "T" + (unloadingPlace.startTime || "07:00:00")) : null;

        const res = {
            id: offer.id,
            from: fromDate,
            latestFrom: latestFrom,
            to: toDate,
            earliestTo: earliestTo,
            status: offer.status,
            fromCity: offer.fromAddress?.city || "Nieznane",
            fromCountry: offer.fromAddress?.country || "Nieznane",
            toCity: offer.toAddress?.city || "Nieznane",
            toCountry: offer.toAddress?.country || "Nieznane",
            details: offer.details?.freightDescription || "Brak opisu"
        }
        return res;
    });

    if (currentOffer) {
        mappedOffers.push(currentOffer);
    }

    return (
        <Card sx={{width: '100%', padding: '20px'}}>
            <CardContent>
                <TimelineBar
                    from={new Date(from)}
                    to={new Date(to)}
                    startCity={startCity}
                    offers={mappedOffers}
                    currentOffer={currentOffer}
                    selectedOfferId={selectedOfferId}
                    onSelectOffer={onSelectOffer}
                />

                <Grid container width="100%">
                    <Grid item size={4} mt={4}>
                        <Typography variant="body2" mt={1} color="textSecondary">
                            {format(new Date(from), "yyyy-MM-dd")}
                        </Typography>
                    </Grid>
                    <Grid item size={4} mt={4} textAlign="center">
                        <Typography variant="body2" mt={1} color="textSecondary">
                            {totalDays} dni
                        </Typography>
                    </Grid>
                    <Grid item size={4} mt={4} textAlign="right">
                        <Typography variant="body2" mt={1} color="textSecondary">
                            {format(new Date(to), "yyyy-MM-dd")}
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};
