import { Box, LinearProgress, Typography } from "@mui/material";

export const ProgressBar = ({ progress, percent, loading, found }) => {
    if (!loading) return null;

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                {progress} ({percent}%)
            </Typography>
            <LinearProgress variant="determinate" value={percent} />
        </Box>
    );
};
