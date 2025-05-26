import {Box} from "@mui/material";
import {TimelineOfferBar} from "./TimelineOfferBar";
import {TimelineDayLabel} from "./TimelineDayLabel";
import {eachDayOfInterval} from "date-fns";
import {TodayMarker} from "./TodayMarker";

type Offer = {
    id: number;
    from: Date;
    to: Date;
    status: string;
    fromCity: string;
    toCity: string;
    details: string;
};

type Props = {
    from: Date;
    to: Date;
    startCity: string;
    offers: Offer[];
};

export const TimelineBar = ({from, to, startCity, offers}: Props) => {
    const totalDays = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const days = eachDayOfInterval({start: from, end: to});

    return (
        <Box position="relative" height={80} bgcolor="#e0e0e0" borderRadius={1} mt={2}>
            {/* Miasto początkowe */}
            <Box
                position="absolute"
                left={0}
                top={-24}
                sx={{fontSize: 12, color: "gray"}}
            >
                {startCity}
            </Box>

            {/* Oferty */}{offers.map((offer, index) => (
            <TimelineOfferBar key={offer.id} offer={offer} from={from} to={to} index={index}/>
        ))}


            {/* Daty */}
            {days.map((day, idx) =>
                totalDays <= 10 || idx % 1 === 0 ? (
                    <TimelineDayLabel key={idx} date={day} from={from} to={to}/>
                ) : null
            )}
            <TodayMarker from={from} to={to}/>
        </Box>
    );
};
