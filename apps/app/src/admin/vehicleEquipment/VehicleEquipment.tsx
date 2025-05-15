// VehicleTypeEdit.tsx
import { Edit, Create } from 'react-admin';
import {AttributeForm} from "../commons/AttributeForm";


export const VehicleEquipmentEdit = () => (
    <Edit>
        <AttributeForm />
    </Edit>
);

export const VehicleEquipmentCreate = () => (
    <Create>
        <AttributeForm />
    </Create>
);
