import { Box } from "@mui/material";
import { format } from "date-fns";
import { getPercent } from "./constants";

type Props = {
    date: Date;
    from: Date;
    to: Date;
};

export const TimelineDayLabel = ({ date, from, to }: Props) => {
    const left = getPercent(date, from, to);

    return (
        <>
            {/* pionowa linia */}
            <Box
                position="absolute"
                left={`${left}%`}
                top={0}
                bottom={0}
                width="1px"
                bgcolor="#bbb"
                sx={{ zIndex: 1 }}
            />

            {/* etykieta daty */}
            <Box
                position="absolute"
                left={`${left}%`}
                top={90}
                sx={{
                    transform: "translateX(-50%)",
                    fontSize: 10,
                    whiteSpace: "nowrap",
                    color: "gray",
                    zIndex: 2,
                }}
            >
                {format(date, "MM-dd")}
            </Box>
        </>
    );
};
