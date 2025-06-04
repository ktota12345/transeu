import {Checkbox, FormControlLabel, FormGroup, Grid, TextField, Typography} from "@mui/material";

const availableSearchServices = ['timocom', 'transEu', 'smartsearch'];

export const SearchParameters = ({
                                     numUnloadingCities,
                                     setNumUnloadingCities,
                                     searchArea,
                                     setSearchArea,
                                     perPage,
                                     setPerPage,
                                     searchServices,
                                     setSearchServices,
                                     useDestinationCityService,
                                     setUseDestinationCityService
                                 }) => {
    const handleCheckboxChange = (service) => {
        if (searchServices.includes(service)) {
            setSearchServices(searchServices.filter(s => s !== service));
        } else {
            setSearchServices([...searchServices, service]);
        }
    };

    return (
        <Grid container spacing={2} mb={4} alignItems="stretch">
            <Grid item xs={12} md={3}>
                <TextField
                    label="Liczba miast końcowych"
                    type="number"
                    value={numUnloadingCities}
                    onChange={(e) => setNumUnloadingCities(e.target.value)}
                    size="small"
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    label="Search Area (km)"
                    type="number"
                    value={searchArea}
                    onChange={(e) => setSearchArea(e.target.value)}
                    size="small"
                    fullWidth
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    label="Liczba wyników na stronę"
                    type="number"
                    value={perPage}
                    onChange={(e) => setPerPage(e.target.value)}
                    size="small"
                    fullWidth
                />
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle1">Źródła ofert</Typography>
                <FormGroup row>
                    {availableSearchServices.map(service => (
                        <FormControlLabel
                            key={service}
                            control={
                                <Checkbox
                                    checked={searchServices.includes(service)}
                                    onChange={() => handleCheckboxChange(service)}
                                />
                            }
                            label={service}
                        />
                    ))}
                </FormGroup>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle1">Inne</Typography>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={useDestinationCityService}
                            onChange={(e) => setUseDestinationCityService(e.target.checked)}
                        />
                    }
                    label="użyj podpowiadania miast"
                />
            </Grid>
        </Grid>
    );
};
