import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button
} from '@mui/material';
import { dateFormat } from '../../data/helpers';

const statusColor = {
    'Dostępny': '#d0f0c0',      // zielony
    'Niedostępny': '#f8d7da',   // czerwony
    'Serwis': '#fff3cd'        // żółty
};

const countOffers = (offers = []) => {
    const counts = {
        accepted: 0,
        pending: 0,
        total: offers.length,
    };

    offers.forEach((offer) => {
        if (offer.status === 'confirmed') counts.accepted++;
        else if (offer.status === 'pending') counts.pending++;
    });

    return counts;
};

const ScheduleExpand = ({ schedules }) => {
    return (
        <TableContainer component={Paper} sx={{ marginTop: '16px' }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Od</TableCell>
                        <TableCell>Do</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Oferty</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {schedules.map((schedule) => {
                        const { accepted, pending, total } = countOffers(schedule.offers || []);
                        const carId = schedule.carId;

                        return (
                            <TableRow
                                key={schedule.id}
                                sx={{
                                    backgroundColor: statusColor[schedule.status] || 'transparent'
                                }}
                            >
                                <TableCell>{dateFormat(schedule.from)}</TableCell>
                                <TableCell>{dateFormat(schedule.to)}</TableCell>
                                <TableCell>{schedule.status}</TableCell>
                                <TableCell>
                                    <span style={{ color: 'green' }}>{accepted}</span>{' / '}
                                    <span style={{ color: 'orange' }}>{pending}</span>{' / '}
                                    <span>{total}</span>{' '}
                                    <Button
                                        variant="text"
                                        size="small"
                                        href={`#/car-schedule-offers?displayedFilters=%7B%22carId%22%3Atrue%7D&filter=%7B%22carId%22%3A${carId}%7D`}
                                        style={{ marginLeft: 8 }}
                                    >
                                        Zobacz oferty
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ScheduleExpand;
