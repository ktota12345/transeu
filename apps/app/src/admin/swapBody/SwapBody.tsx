// SwapBodyEdit.tsx
import { Edit, SimpleForm, TextInput } from 'react-admin';

const SwapBody = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="name" />
        </SimpleForm>
    </Edit>
);

export default SwapBody;
