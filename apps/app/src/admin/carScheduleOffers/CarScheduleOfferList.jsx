import {
    List,
    Datagrid,
    TextField,
    DateField,
    FunctionField,
    ListProps,
    Button,
    ShowButton,
    useRecordContext, useNotify, useRefresh
} from 'react-admin';
import {CarScheduleOfferFilter} from './CarScheduleOfferFilter';
import {Stack} from '@mui/material';
import {Chip} from '@mui/material';
import axiosNest from '../../api/axiosNest';

// Komponent przycisków akcji
const OfferActions = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();

    const handleAccept = async () => {
        try {
            await axiosNest.post(`/car-schedule-offers/${record.id}/accept`);
            notify('Oferta została zatwierdzona', { type: 'success' });
            refresh();
        } catch (error) {
            notify('Błąd podczas zatwierdzania oferty', { type: 'error' });
        }
    };

    const handleReject = async () => {
        try {
            await axiosNest.post(`/car-schedule-offers/${record.id}/reject`);
            notify('Oferta została odrzucona', { type: 'success' });
            refresh();
        } catch (error) {
            notify('Błąd podczas odrzucania oferty', { type: 'error' });
        }
    };

    return (
        <Stack direction="row" spacing={1}>
            <Button label="Akceptuj" onClick={handleAccept} />
            <Button label="Odrzuć" onClick={handleReject} />
            <ShowButton record={record} />
        </Stack>
    );
};

const CarScheduleOfferList = (props: ListProps) => (
    <List {...props} filters={<CarScheduleOfferFilter/>}>
        <Datagrid rowClick={false}>
            <TextField source="id"/>

            <DateField source="fromDate" label="Od"/>
            <DateField source="toDate" label="Do"/>

            {/* FROM Address */}
            <FunctionField
                label="Skąd"
                render={(record: any) =>
                    record.details?.loadingPlaces?.[0]?.address
                        ? `${record.details.loadingPlaces[0].address.city}, ${record.details.loadingPlaces[0].address.postalCode}, ${record.details.loadingPlaces[0].address.country}`
                        : '—'
                }
            />

            {/* TO Address */}
            <FunctionField
                label="Dokąd"
                render={(record: any) =>
                    record.details?.loadingPlaces?.[1]?.address
                        ? `${record.details.loadingPlaces[1].address.city}, ${record.details.loadingPlaces[1].address.postalCode}, ${record.details.loadingPlaces[1].address.country}`
                        : '—'
                }
            />

            <FunctionField
                label="Status"
                render={(record: any) => {
                    const status = record.status;
                    const statusMap: Record<string, { label: string; color: 'default' | 'primary' | 'success' | 'error' }> = {
                        pending: {label: 'Do zatwierdzenia', color: 'default'},
                        confirmed: {label: 'Zatwierdzona', color: 'success'},
                        rejected: {label: 'Odrzucona', color: 'error'},
                    };

                    const statusInfo = statusMap[status] || {label: status, color: 'default'};

                    return <Chip label={statusInfo.label} color={statusInfo.color} size="small"/>;
                }}
            />

            {/* Cena */}
            <FunctionField
                label="Cena"
                render={(record: any) => record.details?.price?.amount ?? '—'}
            />

            {/* Waluta */}
            <FunctionField
                label="Waluta"
                render={(record: any) => record.details?.price?.currency ?? '—'}
            />

            {/* Stawka za km */}
            <FunctionField
                label="Stawka za km"
                render={(record: any) => record.details?.pricePerKm?.toFixed(2) ?? '—'}
            /><FunctionField
            label="Link do oferty"
            render={(record: any) =>
                record.externalLink ? (
                    <a href={record.externalLink} target="_blank" rel="noopener noreferrer">
                        Zobacz ofertę
                    </a>
                ) : (
                    '—'
                )
            }
        />


            {/* Akcje */}
            <FunctionField
                label="Akcje"
                render={() => <OfferActions/>}
            />
        </Datagrid>
    </List>
);

export default CarScheduleOfferList;
