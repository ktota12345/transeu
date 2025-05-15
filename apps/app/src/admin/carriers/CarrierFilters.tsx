import { TextInput } from 'react-admin';

const CarrierFilters = [
    <TextInput label="Nazwa" source="name" alwaysOn key="name" />,
    <TextInput label="Miasto" source="city" key="city" />,
    <TextInput label="Województwo" source="region" key="region" />,
    <TextInput label="Typ" source="type" key="type" />,
    <TextInput label="Nr licencji" source="licenseNumber" key="licenseNumber" />,
];

export default CarrierFilters;
