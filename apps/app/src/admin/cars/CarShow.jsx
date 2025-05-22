import { Show, useRecordContext, Button } from 'react-admin';
import { Link as RouterLink } from 'react-router-dom';
import { Grid } from '@mui/material';
import { General } from './CarShow/General';
import { Features } from './CarShow/Features';
import { Additional } from './CarShow/Additional';
import { ScheduleList } from './CarShow/ScheduleList';
import LaunchIcon from '@mui/icons-material/Launch';

const OffersButton = () => {
    const record = useRecordContext();
    if (!record) return null;

    // Załóżmy, że oferty są dostępne pod ścieżką /offers?carId=...
    const to = `/admin/#/car-schedule-offers?displayedFilters=%7B%22carId%22%3Atrue%7D&filter=%7B%22carId%22%3A${record.id}%7D`;

    return (
        <Button
            component={RouterLink}
            to={to}
            label="Zobacz oferty"
            startIcon={<LaunchIcon />}
            variant="outlined"
            sx={{ mb: 2 }}
            target="_blank"

        />
    );
};

export const CarShow = () => (
    <Show>
        <OffersButton />
        <Grid
            container
            spacing={2}
            mb={4}
            alignItems="stretch"
        >
            {[General, Features, Additional].map((Component, idx) => (
                <Grid
                    item
                    key={idx}
                    xs={12}
                    md={4}
                    sx={{ display: 'flex', flexDirection: 'column', width:'30%' }}
                >
                    <Component />
                </Grid>
            ))}
        </Grid>

        <ScheduleList mt={4} />
    </Show>
);
