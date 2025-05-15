// VehicleTypeEdit.tsx
import { Edit, Create } from 'react-admin';
import {AttributeForm} from "../commons/AttributeForm";


export const VehicleTypeEdit = () => (
    <Edit>
        <AttributeForm />
    </Edit>
);

export const VehicleTypeCreate = () => (
    <Create>
        <AttributeForm />
    </Create>
);