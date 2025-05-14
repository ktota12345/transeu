import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import { dateFormat } from '../../data/helpers';

const statusColor = {
    'Dostępny': '#d0f0c0',      // zielony
    'Niedostępny': '#f8d7da',   // czerwony
    'Serwis': '#fff3cd'        // żółty
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
                        <TableCell>Obłożenie %</TableCell>
                        <TableCell>Oferty</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {schedules.map((schedule) => (
                        <TableRow
                            key={schedule.id}
                            sx={{
                                backgroundColor: statusColor[schedule.status] || 'transparent'
                            }}
                        >
                            <TableCell>{dateFormat(schedule.from)}</TableCell>
                            <TableCell>{dateFormat(schedule.to)}</TableCell>
                            <TableCell>{schedule.status}</TableCell>
                            <TableCell>?? %</TableCell>
                            <TableCell>0</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ScheduleExpand;
