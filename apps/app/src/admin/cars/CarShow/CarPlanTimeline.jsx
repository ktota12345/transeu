import { Card, CardContent, Typography } from "@mui/material";
import { TimelineBar } from "./Timeline/TimelineBar";
import { format } from "date-fns";

const data = {
    futureSchedules: {
        from: new Date("2025-05-20T00:00:00"),
        to: new Date("2025-06-10T00:00:00"),
        startCity: "Warszawa"
    },
    offers: [
        {
            id: 1,
            from: new Date("2025-05-25"),
            to: new Date("2025-05-26"),
            status: "confirmed",
            fromCity: "Warszawa",
            toCity: "Berlin",
            details: "Transport towarów do Berlina"
        },
        {
            id: 2,
            from: new Date("2025-05-28"),
            to: new Date("2025-05-30"),
            status: "pending",
            fromCity: "Berlin",
            toCity: "Praga",
            details: "Oczekuje na zatwierdzenie"
        },
        {
            id: 3,
            from: new Date("2025-06-01"),
            to: new Date("2025-06-02"),
            status: "cancelled",
            fromCity: "Praga",
            toCity: "Wiedeń",
            details: "Oferta anulowana"
        }
    ]
};

export const CarPlanTimeline = () => {
    const { futureSchedules, offers } = data;
    const totalDays = Math.round((futureSchedules.to.getTime() - futureSchedules.from.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>Plan samochodu</Typography>

                <TimelineBar
                    from={futureSchedules.from}
                    to={futureSchedules.to}
                    startCity={futureSchedules.startCity}
                    offers={offers}
                />

                <Typography variant="body2" mt={1} color="textSecondary">
                    Zakres planu: {format(futureSchedules.from, "yyyy-MM-dd")} – {format(futureSchedules.to, "yyyy-MM-dd")} ({totalDays} dni)
                </Typography>
            </CardContent>
        </Card>
    );
};
