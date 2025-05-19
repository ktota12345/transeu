import { Card, CardContent, Typography, Box } from "@mui/material";
import {
    ChipField,
    ReferenceArrayField,
    SingleFieldList,
} from "react-admin";

export const Features = () => (
    <Card sx={{ height: '100%', width: '100%' }}>
        <CardContent>
            <Typography variant="h6" gutterBottom>Cechy pojazdu</Typography>

            <Box mb={2}>
                <Typography variant="body2" color="textSecondary">Typy pojazdu</Typography>
                <ReferenceArrayField source="vehicleTypes" reference="vehicle-types">
                    <SingleFieldList><ChipField source="name" /></SingleFieldList>
                </ReferenceArrayField>
            </Box>

            <Box mb={2}>
                <Typography variant="body2" color="textSecondary">Zabezpieczenia ładunku</Typography>
                <ReferenceArrayField source="vehicleLoadSecurings" reference="vehicle-load-securing">
                    <SingleFieldList><ChipField source="name" /></SingleFieldList>
                </ReferenceArrayField>
            </Box>

            <Box mb={2}>
                <Typography variant="body2" color="textSecondary">Wyposażenie pojazdu</Typography>
                <ReferenceArrayField source="vehicleEquipments" reference="vehicle-equipment">
                    <SingleFieldList><ChipField source="name" /></SingleFieldList>
                </ReferenceArrayField>
            </Box>

            <Box mb={2}>
                <Typography variant="body2" color="textSecondary">Wymienne nadwozia</Typography>
                <ReferenceArrayField source="swapBodies" reference="swap-body">
                    <SingleFieldList><ChipField source="name" /></SingleFieldList>
                </ReferenceArrayField>
            </Box>

            <Box>
                <Typography variant="body2" color="textSecondary">Właściwości nadwozia</Typography>
                <ReferenceArrayField source="bodyProperties" reference="body-property">
                    <SingleFieldList><ChipField source="name" /></SingleFieldList>
                </ReferenceArrayField>
            </Box>

        </CardContent>
    </Card>
);
