import {
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
    ReferenceInput,
    PasswordInput,
} from 'react-admin';
import {limitedRoles, privilegesOptions, roles} from '../../shared/permissions';
import {useAuth} from "../../components/auth/useAuth";

const UserCreate = () => {
    const {hasPrivilege} = useAuth();
    return (
        <Create mutationMode="pessimistic">
            <SimpleForm>
                <TextInput source="email" />
                <TextInput source="username" />
                <PasswordInput source="password" />
                <SelectInput source="role" choices={hasPrivilege(privilegesOptions.MANAGE_ALL_USERS) ? roles : limitedRoles}/>
                {hasPrivilege(privilegesOptions.MANAGE_ALL_USERS) && (
                    <ReferenceInput source="companyId" reference="companies" allowEmpty>
                        <SelectInput optionText="name"/>
                    </ReferenceInput>
                )}
            </SimpleForm>
        </Create>
    );
}

export default UserCreate;

// Dodaj to, jeśli dalej TS narzeka:
export {};
