import {
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    ReferenceInput,
    PasswordInput,
} from 'react-admin';

import {limitedRoles, privilegesOptions, roles} from '../../shared/permissions';
import {useAuth} from "../../components/auth/useAuth";

const UserEdit = () => {

    const {hasPrivilege} = useAuth();
    return (
        <Edit mutationMode="pessimistic">
            <SimpleForm>
                <TextInput source="email" disabled/>
                <TextInput source="username"/>
                <PasswordInput source="password" autoComplete="new-password"/>
                <SelectInput source="role" choices={hasPrivilege(privilegesOptions.MANAGE_ALL_USERS) ? roles : limitedRoles}/>
                {hasPrivilege(privilegesOptions.MANAGE_ALL_USERS) && (
                    <ReferenceInput source="companyId" reference="companies" allowEmpty>
                        <SelectInput optionText="name"/>
                    </ReferenceInput>
                )}
            </SimpleForm>
        </Edit>
    );
}

export default UserEdit;
