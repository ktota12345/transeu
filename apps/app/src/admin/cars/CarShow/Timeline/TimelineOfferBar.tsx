import {Box, Tooltip, Typography} from "@mui/material";
import {format} from "date-fns";
import {STATUS_COLORS, getPercent} from "./constants";
import {Offer} from "./types";

type Props = {
    offer: Offer;
    from: Date;
    to: Date;
    index: number;
};

export const TimelineOfferBar = ({offer, from, to, index}: Props) => {
    const leftFrom = getPercent(offer.from, from, to);
    const leftLatestFrom = getPercent(offer.latestFrom || offer.from, from, to);
    const rightEarliestTo = getPercent(offer.earliestTo || offer.to, from, to);
    const rightTo = getPercent(offer.to, from, to);

    const mainLeft = leftLatestFrom;
    const mainRight = rightEarliestTo;

    const topPosition = index % 2 === 0 ? 18 : 44;

    // Kolory: jasny kolor dla rozszerzeń (odcinki po bokach), normalny dla środka
    const baseColor = STATUS_COLORS[offer.status];
    // Można zrobić jaśniejszy kolor np. transparentny albo z opacity
    const lightColor = baseColor + "60"; // np. półprzezroczysty
    const lightColor2 = baseColor + "80"; // jeszcze jaśniejszy

    const tooltipContent = (

        <>
            <strong>Status:</strong> {offer.status}<br/>
            <strong>Miasta:</strong> {offer.fromCity} ({offer.fromCountry}) → {offer.toCity} ({offer.toCountry})<br/>
            <strong>Daty:</strong> {format(offer.from, "yyyy-MM-dd")} – {format(offer.to, "yyyy-MM-dd")}<br/>
            {offer.details}
        </>
    );

    return (
        <>
            {(offer.latestFrom && offer.latestFrom > offer.from) && (
                <Tooltip title={tooltipContent}>
                    <Box
                        position="absolute"
                        left={`${leftFrom}%`}
                        width={`${leftLatestFrom - leftFrom}%`}
                        height={24}
                        top={topPosition}
                        bgcolor={lightColor}
                        borderRadius={1}
                        sx={{cursor: "pointer", whiteSpace: "nowrap"}}
                    />
                </Tooltip>
            )}

            {(offer.earliestTo && offer.earliestTo < offer.to) && (
                <Tooltip title={tooltipContent}>
                    <Box
                        position="absolute"
                        left={`${rightEarliestTo}%`}
                        width={`${rightTo - rightEarliestTo}%`}
                        height={24}
                        top={topPosition}
                        bgcolor={lightColor2}
                        borderRadius={1}
                        sx={{cursor: "pointer", whiteSpace: "nowrap"}}
                    />
                </Tooltip>
            )}

            <Tooltip
                title={tooltipContent}
            >
                <Box
                    position="absolute"
                    left={`${mainLeft}%`}
                    width={`${mainRight - mainLeft}%`}
                    height={24}
                    top={topPosition}
                    bgcolor={baseColor}
                    borderRadius={1}
                    sx={{
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        paddingLeft: 1,
                        paddingRight: 1,
                        zIndex: 10
                    }}

                >
                    <Typography lineHeight={"24px"} align={"center"} color="#FFFFFF" fontSize={10}>{offer.toCity} ({offer.toCountry})</Typography>
                </Box>
            </Tooltip>
        </>
    );
};

