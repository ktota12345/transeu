import {Card, CardContent, Grid, Typography} from "@mui/material";
import {ReferenceField, TextField, useRecordContext} from "react-admin";

export const General = () => {
    const record = useRecordContext();
    if (!record) return null;

    return (
        <Card sx={{height: '100%', width: '100%'}}>
            <CardContent>
                <Typography variant="h6" gutterBottom>Dane podstawowe</Typography>
                <Grid spacing={1}>
                    <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">Nazwa</Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <TextField source="name"/>
                    </Grid>

                    <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">Nr rejestracyjny</Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <TextField source="registrationNumber"/>
                    </Grid>

                    <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">Typ naczepy</Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <TextField source="trailerType"/>
                    </Grid>

                    <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">Kierowca</Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <ReferenceField source="driverId" reference="drivers" link={false}>
                            <TextField source="name"/>
                        </ReferenceField>
                    </Grid>

                    <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">Przewoźnik</Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <ReferenceField source="carrierId" reference="carriers" link={false}>
                            <TextField source="name"/>
                        </ReferenceField>
                    </Grid>
                </Grid>
                <Typography variant="h6" gutterBottom>Adres bazowy</Typography>
                <Grid container spacing={1}>
                    <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">Kraj</Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <TextField source="baseAddress.country"/>
                    </Grid>

                    <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">Kod pocztowy</Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <TextField source="baseAddress.postalCode"/>
                    </Grid>

                    <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">Miasto</Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <TextField source="baseAddress.city"/>
                    </Grid>
                </Grid>

            </CardContent>
        </Card>
    );
};
