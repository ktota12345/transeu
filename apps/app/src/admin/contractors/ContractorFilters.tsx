import { TextInput, BooleanInput } from 'react-admin';

const ContractorFilters = [
    <TextInput source="name" label="Nazwa" alwaysOn />,
    <BooleanInput source="blacklisted" label="Na czarnej liście" />,
];

export default ContractorFilters;
