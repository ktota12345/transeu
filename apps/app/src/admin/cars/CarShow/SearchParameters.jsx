// components/SearchParameters.tsx
import {Grid, TextField} from "@mui/material";

export const SearchParameters = ({
                                     numLoadingCities,
                                     setNumLoadingCities,
                                     numUnloadingCities,
                                     setNumUnloadingCities,
                                     searchArea,
                                     setSearchArea,
                                     perPage,
                                     setPerPage
                                 }) => {
    return (
        <Grid container spacing={2} mb={4} alignItems="stretch">
            <Grid item xs={12} md={3} sx={{display: 'flex', flexDirection: 'column', width: '20%'}}>
                <TextField
                    label="Liczba miast początkowych"
                    type="number"
                    value={numLoadingCities}
                    onChange={(e) => setNumLoadingCities(e.target.value)}
                    size="small"
                />
            </Grid>
            <Grid item xs={12} md={3} sx={{display: 'flex', flexDirection: 'column', width: '20%'}}>
                <TextField
                    label="Liczba miast końcowych"
                    type="number"
                    value={numUnloadingCities}
                    onChange={(e) => setNumUnloadingCities(e.target.value)}
                    size="small"
                />
            </Grid>
            <Grid item xs={12} md={3} sx={{display: 'flex', flexDirection: 'column', width: '20%'}}>
                <TextField
                    label="Search Area (km)"
                    type="number"
                    value={searchArea}
                    onChange={(e) => setSearchArea(e.target.value)}
                    size="small"
                />
            </Grid>
            <Grid item xs={12} md={3} sx={{display: 'flex', flexDirection: 'column', width: '20%'}}>
                <TextField
                    label="Liczba wyników na stronę"
                    type="number"
                    value={perPage}
                    onChange={(e) => setPerPage(e.target.value)}
                    size="small"
                />
            </Grid>
        </Grid>
    );
};
