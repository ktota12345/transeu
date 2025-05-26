import { Card, CardContent, Typography, Grid } from "@mui/material";
import { TimelineBar } from "./Timeline/TimelineBar";
import { format } from "date-fns";

export const CarPlanTimeline = ({
                                    from,
                                    to,
                                    startCity = "Nieznane",
                                    assignedOffers = [],
                                    currentOffer = null
                                }) => {
    if (!from || !to) return null;

    const totalDays = Math.round((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24));

    const mappedOffers = assignedOffers.map((offer) => ({
        id: offer.id,
        from: new Date(offer.fromDate),
        to: new Date(offer.toDate),
        status: offer.status,
        fromCity: offer.fromAddress?.city || "Nieznane",
        toCity: offer.toAddress?.city || "Nieznane",
        details: offer.details?.freightDescription || "Brak opisu"
    }));

    if(currentOffer){
        mappedOffers.push(currentOffer);
    }

    return (
        <Card sx={{ width: '100%', padding: '20px' }}>
            <CardContent>
                <TimelineBar
                    from={new Date(from)}
                    to={new Date(to)}
                    startCity={startCity}
                    offers={mappedOffers}
                    currentOffer={currentOffer} // przewidziany parametr
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
