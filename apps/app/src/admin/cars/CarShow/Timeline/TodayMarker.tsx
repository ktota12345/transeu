import { Box } from "@mui/material";
import { isWithinInterval } from "date-fns";
import { getPercent } from "./constants";

type Props = {
    from: Date;
    to: Date;
};

export const TodayMarker = ({ from, to }: Props) => {
    const today = new Date();

    // Jeżeli dzisiejszy dzień nie mieści się w zakresie planu, nie rysuj
    if (!isWithinInterval(today, { start: from, end: to })) return null;

    const left = getPercent(today, from, to);

    return (
        <Box
            position="absolute"
            left={`${left}%`}
            top={0}
            bottom={0}
            width={2}
            bgcolor="blue"
            sx={{ zIndex: 10, borderRadius: 1 }}
        >
            <Box
                position="absolute"
                top={6}
                left="50%"
                sx={{
                    transform: "translateX(-50%)",
                    width: 6,
                    height: 6,
                    bgcolor: "blue",
                    borderRadius: "50%"
                }}
            />
        </Box>
    );
};
