import { Create, SimpleForm } from 'react-admin';
import CompanyFormFields from './CompanyFormFields';

export const CompanyCreate = () => (
    <Create mutationMode="pessimistic">
        <SimpleForm>
            <CompanyFormFields />
        </SimpleForm>
    </Create>
);
