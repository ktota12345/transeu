import {
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    ReferenceInput,
    PasswordInput,
} from 'react-admin';

import { roles } from '../../shared/permissions';

const UserEdit = () => (
    <Edit mutationMode="pessimistic">
        <SimpleForm>
            <TextInput source="email" disabled />
            <TextInput source="username" />
            <PasswordInput source="password"  autoComplete="new-password" />
            <SelectInput source="role" choices={roles} />
            <ReferenceInput source="companyId" reference="companies" allowEmpty>
                <SelectInput optionText="name" />
            </ReferenceInput>
        </SimpleForm>
    </Edit>
);

export default UserEdit;
