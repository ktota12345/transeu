import { Box, Tooltip } from "@mui/material";
import { format } from "date-fns";
import { STATUS_COLORS, getPercent } from "./constants";

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
    offer: Offer;
    from: Date;
    to: Date;
};

export const TimelineOfferBar = ({ offer, from, to }: Props) => {
    const left = getPercent(offer.from, from, to);
    const right = getPercent(offer.to, from, to);
    const width = right - left;

    return (
        <Tooltip
            title={
                <>
                    <strong>Status:</strong> {offer.status}<br />
                    <strong>Miasta:</strong> {offer.fromCity} → {offer.toCity}<br />
                    <strong>Daty:</strong> {format(offer.from, "yyyy-MM-dd")} – {format(offer.to, "yyyy-MM-dd")}<br />
                    {offer.details}
                </>
            }
        >
            <Box
                position="absolute"
                left={`${left}%`}
                width={`${width}%`}
                height={24}
                top={18}
                bgcolor={STATUS_COLORS[offer.status]}
                borderRadius={1}
                sx={{ cursor: "pointer" }}
            />
        </Tooltip>
    );
};
