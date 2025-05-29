import React from "react";
import { TableCell, Typography } from "@mui/material";
import {dateFormat} from "../../../data/helpers";

const PlaceInfoCell = ({ place }) => {
    if (!place) return <TableCell>-</TableCell>;

    return (
        <>
            {place.address?.city || "-"} ({place.address?.country || "-"})
            <Typography
                variant="body2"
                color="textSecondary"
                fontSize="0.8rem"
                sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
                {dateFormat(place.earliestLoadingDate) || "-"} {place.startTime || ""}
                <br />
                {dateFormat(place.latestLoadingDate) || "-"} {place.endTime || ""}
            </Typography>
        </>
    );
};

export default PlaceInfoCell;
