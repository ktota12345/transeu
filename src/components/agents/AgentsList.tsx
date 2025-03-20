import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Heading,
    Button
} from '@chakra-ui/react';
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer
} from '@chakra-ui/table';
import { AppDispatch, RootState } from '../../store/store';
import { fetchAgents } from '../../features/agents/agentsSlice';

export const AgentsList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { agents, status, error } = useSelector((state: RootState) => state.agents);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchAgents());
        }
    }, [status, dispatch]);

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (status === 'failed') {
        return <div>Error: {error}</div>;
    }

    return (
        <Box p={4}>
            <Heading mb={4}>Lista agentów</Heading>
            <TableContainer>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Nazwa</Th>
                            <Th>Status</Th>
                            <Th>Częstotliwość sprawdzania</Th>
                            <Th>Godziny pracy</Th>
                            <Th>Akcje</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {agents.map((agent) => (
                            <Tr key={agent.id}>
                                <Td>{agent.name}</Td>
                                <Td>{agent.isActive ? 'Aktywny' : 'Nieaktywny'}</Td>
                                <Td>
                                    {agent.checkFrequency === 'custom'
                                        ? `Co ${agent.customCheckInterval} minut`
                                        : agent.checkFrequency === 'live'
                                        ? 'Na żywo'
                                        : agent.checkFrequency === 'hourly'
                                        ? 'Co godzinę'
                                        : `Co ${agent.checkFrequency.replace('min', ' minut')}`}
                                </Td>
                                <Td>{`${agent.workingHours.start} - ${agent.workingHours.end}`}</Td>
                                <Td>
                                    <Button size="sm" colorScheme="blue" mr={2}>
                                        Edytuj
                                    </Button>
                                    <Button size="sm" colorScheme="red">
                                        Usuń
                                    </Button>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
};
