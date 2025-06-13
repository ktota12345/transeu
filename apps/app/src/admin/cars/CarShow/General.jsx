import {Card, CardContent, Grid, Typography} from "@mui/material";
import { ReferenceArrayField, ReferenceField, SingleFieldList, TextField, useGetOne, useRecordContext} from "react-admin";

export const General = () => {
    const record = useRecordContext();
    const { data: driver } = useGetOne('drivers', { id: record?.driverId??0 });
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
                        <ReferenceField source="driverId" reference="drivers" link='edit'>
                            <TextField source="name"/> <TextField source="surname"/>
                        </ReferenceField>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">Dozwolone kraje</Typography>
                    </Grid>
                    <Grid item xs={8} style={{paddingBottom:10, paddingTop:5}}>
                        {driver && driver.allowedCountries && driver.allowedCountries.length > 0 ? (
                            <ReferenceArrayField reference="countries" source="allowedCountries" record={driver} >
                                <SingleFieldList linkType={false}>
                                    <TextField source="code" style={{fontSize:11,lineHeight:'100%'}}/>
                                </SingleFieldList>
                            </ReferenceArrayField>
                        ) : (
                            <Typography variant="body2" color="textSecondary">Brak dozwolonych krajów</Typography>
                        )}
                    </Grid>

                    <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary"  link='edit'>Przewoźnik</Typography>
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
                        <Typography color="textSecondary">Kraj</Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <TextField source="baseAddress.country"/>
                    </Grid>

                    <Grid item xs={4}>
                        <Typography color="textSecondary">Kod</Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <TextField source="baseAddress.postalCode"/>
                    </Grid>

                    <Grid item xs={4}>
                        <Typography color="textSecondary">Miasto</Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <TextField source="baseAddress.city"/>
                    </Grid>
                </Grid>

            </CardContent>
        </Card>
    );
};
