import {
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
    ReferenceInput,
    PasswordInput,
} from 'react-admin';

const roles = [
    { id: 'ADMIN', name: 'Administrator' },
    { id: 'USER', name: 'Użytkownik' },
    { id: 'GUEST', name: 'Gość' },
];

const UserCreate = () => (
    <Create mutationMode="pessimistic">
        <SimpleForm>
            <TextInput source="email" />
            <TextInput source="username" />
            <PasswordInput source="password" />
            <SelectInput source="role" choices={roles} defaultValue="USER" />
            <ReferenceInput source="companyId" reference="companies" allowEmpty>
                <SelectInput optionText="name" />
            </ReferenceInput>
        </SimpleForm>
    </Create>
);

export default UserCreate;

// Dodaj to, jeśli dalej TS narzeka:
export {};
