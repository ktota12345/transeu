import {
    AutocompleteInput,
    Edit,
    ReferenceInput,
    SimpleForm,
    TextInput,
    ReferenceArrayInput,
    CheckboxGroupInput,
    useNotify,
} from 'react-admin';

const DriverEdit = () => {

    const notify = useNotify();
    return (
        <Edit
            mutationMode="pessimistic"
            mutationOptions={{
                onSuccess: () => {
                    notify('Zapisano zmiany', { type: 'success' });
                    // brak redirectu = zostaje na stronie
                },
            }}
        >
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="name" label="Imię" />
                <TextInput source="surname" label="Nazwisko" />
                <TextInput source="phone" label="Telefon" />
                <TextInput source="email" label="Email" />

                <ReferenceInput source="carrierId" reference="carriers" label="Przewoźnik" allowEmpty>
                    <AutocompleteInput optionText="name" />
                </ReferenceInput>

                <ReferenceArrayInput
                    source="allowedCountries" // to musi być zgodne z nazwą pola w danych
                    reference="countries"
                    label="Dozwolone kraje"
                    perPage={250}
                    sort={{ field: 'name', order: 'ASC' }}
                >
                    <CheckboxGroupInput optionText="name" />
                </ReferenceArrayInput>
            </SimpleForm>
        </Edit>
    );
}

export default DriverEdit;
