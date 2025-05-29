import {Box, Tooltip, Typography} from "@mui/material";
import {format} from "date-fns";
import {STATUS_COLORS, getPercent, OfferStatus} from "./constants";
import {Offer} from "./types";

type Props = {
    offer: Offer;
    from: Date;
    to: Date;
    index: number;
    selectedOfferId: number | null;
    onSelect: (id: number) => void;
};
export const TimelineOfferBar = ({
                                     offer,
                                     from,
                                     to,
                                     index,
                                     selectedOfferId,
                                     onSelect
                                 }: Props) => {
    const leftFrom = getPercent(offer.from, from, to);
    const leftLatestFrom = getPercent(offer.latestFrom || offer.from, from, to);
    const rightEarliestTo = getPercent(offer.earliestTo || offer.to, from, to);
    const rightTo = getPercent(offer.to, from, to);

    const containerLeft = leftFrom;
    const containerWidth = rightTo - leftFrom;

    const row = index % 3;
    const topPosition = 38 * row + 20;


    const baseColor = STATUS_COLORS[offer.status as OfferStatus];
    const lightColor = baseColor + "60";
    const lightColor2 = baseColor + "80";

    const isSelected = selectedOfferId === offer.id;

    const tooltipContent = (
        <>
            <strong>Status:</strong> {offer.status}<br/>
            <strong>Miasta:</strong> {offer.fromCity} ({offer.fromCountry}) → {offer.toCity} ({offer.toCountry})<br/>
            <strong>Daty:</strong> {format(offer.from, "yyyy-MM-dd")} – {format(offer.to, "yyyy-MM-dd")}<br/>
            {offer.details}
        </>
    );
    console.log(offer);
    const isOverlap = offer.latestFrom && offer.latestFrom >= offer.to;

    //const isOverlap = true;
    return (
        <Tooltip title={tooltipContent}>
            <Box
                position="absolute"
                left={`${containerLeft}%`}
                width={`${containerWidth}%`}
                top={topPosition}
                height={24}
                borderRadius={1}
                onClick={() => onSelect(offer.id)}
                sx={{
                    cursor: "pointer",
                    outline: isSelected ? `2px solid ${baseColor}` : `1px solid ${baseColor}`,
                    outlineOffset: "2px",
                    zIndex: isSelected ? 20 : (10 + index),
                    position: "absolute",
                }}
            >
                <Box
                    position="relative"
                    width="100%"
                    height="100%"
                    borderRadius={1}
                >
                    {/* Left Extension */}
                    {offer.latestFrom && offer.latestFrom > offer.from && (
                        <Box
                            position="absolute"
                            left={0}
                            width={`${(leftLatestFrom - leftFrom) / (rightTo - leftFrom) * 100}%`}
                            height="100%"
                            bgcolor={lightColor}
                            borderRadius={1}
                        />
                    )}

                    {/* Right Extension */}
                    {offer.earliestTo && offer.earliestTo < offer.to && (
                        <Box
                            position="absolute"
                            left={`${(rightEarliestTo - leftFrom) / (rightTo - leftFrom) * 100}%`}
                            width={`${(rightTo - rightEarliestTo) / (rightTo - leftFrom) * 100}%`}
                            height="100%"
                            bgcolor={lightColor2}
                            borderRadius={1}
                        />
                    )}

                    {/* Main segment */}
                    {/* Main segment */}
                    <Box
                        position="absolute"
                        left={isOverlap ? 'auto' : `${(leftLatestFrom - leftFrom) / (rightTo - leftFrom) * 100}%`}
                        right={isOverlap ? `${(rightTo - rightEarliestTo) / (rightTo - leftFrom) * 100}%` : 'auto'}
                        width={`${(rightEarliestTo - leftLatestFrom) / (rightTo - leftFrom) * 100}%`}
                        height="100%"
                        bgcolor={baseColor}
                        borderRadius={1}
                        display="flex"
                        alignItems="center"
                        justifyContent={isOverlap ? "flex-end" : "center"}
                        px={1}
                        sx={{
                            overflow: 'hidden',           // kluczowe, żeby nic nie wychodziło poza box
                            whiteSpace: 'nowrap',         // nie zawijamy tekstu
                            textOverflow: 'ellipsis',     // skracamy tekst z "..."
                            minWidth: '30px'              // opcjonalnie minimalna szerokość, by tekst się nie zlewał
                        }}
                    >
                        <Typography color="#fff" fontSize={10} lineHeight="24px" noWrap>
                            {offer.toCity} ({offer.toCountry})
                        </Typography>
                    </Box>

                </Box>
            </Box>
        </Tooltip>
    );
};
