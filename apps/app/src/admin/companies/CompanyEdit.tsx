import { Edit, SimpleForm } from 'react-admin';
import CompanyFormFields from './CompanyFormFields';

export const CompanyEdit = () => (
    <Edit mutationMode="pessimistic">
        <SimpleForm>
            <CompanyFormFields />
        </SimpleForm>
    </Edit>
);
