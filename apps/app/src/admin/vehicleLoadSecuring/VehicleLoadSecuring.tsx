// VehicleTypeEdit.tsx
import { Edit, Create } from 'react-admin';
import {AttributeForm} from "../commons/AttributeForm";


export const VehicleLoadSecuringEdit = () => (
    <Edit>
        <AttributeForm />
    </Edit>
);

export const VehicleLoadSecuringCreate = () => (
    <Create>
        <AttributeForm />
    </Create>
);
