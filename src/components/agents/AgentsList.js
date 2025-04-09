import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    VStack,
    Heading,
    Button,
    HStack,
    Text,
    Flex,
    Badge,
    Card,
    CardBody,
    CardHeader,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Tooltip,
    useColorModeValue,
    useToast
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
import {
    fetchAgents,
    deleteAgent,
    removeAgentLocally,
    cleanupNonExistentAgents
} from '../../features/agents/agentsSlice';

// Simple icons
const SearchIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const AddIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const EditIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const DeleteIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

const HistoryIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

export const AgentsList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { agents, status, error } = useSelector((state) => state.agents);
    const cardBg = useColorModeValue('white', 'gray.700');
    const toast = useToast();

    useEffect(() => {
        // Zawsze próbuj pobrać agentów przy montowaniu komponentu.
        // Logika w Redux (createAsyncThunk) powinna zapobiegać zbędnym zapytaniom,
        // jeśli dane są już ładowane lub zostały niedawno pobrane.
        dispatch(fetchAgents());
    }, [dispatch]);

    const handleAddNew = () => {
        navigate('/agent/new');
    };

    const handleEdit = (id) => {
        navigate(`/agent/${id}`);
    };

    const handleDelete = (id) => {
        dispatch(deleteAgent(id))
            .unwrap()
            .then(() => {
                toast({
                    title: 'Agent usunięty',
                    description: 'Agent został pomyślnie usunięty',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            })
            .catch((error) => {
                // Jeśli agent nie istnieje w bazie danych, usuń go tylko lokalnie
                if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
                    dispatch(removeAgentLocally(id));
                    toast({
                        title: 'Agent usunięty',
                        description: 'Agent został usunięty z listy',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                    });
                } else {
                    toast({
                        title: 'Błąd',
                        description: `Nie udało się usunąć agenta: ${error.message}`,
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                }
            });
    };

    const handleCleanup = () => {
        dispatch(cleanupNonExistentAgents())
            .unwrap()
            .then((nonExistentIds) => {
                if (nonExistentIds.length > 0) {
                    toast({
                        title: 'Czyszczenie zakończone',
                        description: `Usunięto ${nonExistentIds.length} agentów, których nie ma w bazie danych`,
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                    });
                } else {
                    toast({
                        title: 'Czyszczenie zakończone',
                        description: 'Nie znaleziono agentów do usunięcia',
                        status: 'info',
                        duration: 3000,
                        isClosable: true,
                    });
                }
            })
            .catch((error) => {
                toast({
                    title: 'Błąd',
                    description: `Nie udało się wyczyścić listy agentów: ${error.message}`,
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            });
    };

    const handleViewHistory = (id) => {
        navigate(`/agent/${id}/history`);
    };

    if (status === 'loading') {
        return (
            <Card bg={cardBg} shadow="md" p={4}>
                <CardBody>
                    <Flex justify="center" align="center" h="200px">
                        <Text fontSize="lg">Ładowanie danych...</Text>
                    </Flex>
                </CardBody>
            </Card>
        );
    }

    if (status === 'failed') {
        return (
            <Card bg={cardBg} shadow="md" p={4}>
                <CardBody>
                    <Flex justify="center" align="center" h="200px" direction="column">
                        <Text fontSize="lg" color="red.500" mb={2}>Wystąpił błąd podczas ładowania danych</Text>
                        <Text>{error}</Text>
                    </Flex>
                </CardBody>
            </Card>
        );
    }

    return (
        <VStack spacing={6} align="stretch">
            <Card bg={cardBg} shadow="sm" p={4}>
                <CardHeader p={0} mb={4}>
                    <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'flex-start', md: 'center' }} wrap="wrap" gap={4}>
                        <Heading size="lg" color="gray.700">Lista agentów</Heading>
                        <HStack spacing={4}>
                            <InputGroup maxW="300px">
                                <InputLeftElement pointerEvents="none">
                                    <SearchIcon color="gray.400" boxSize={4} />
                                </InputLeftElement>
                                <Input placeholder="Szukaj agenta..." borderRadius="md" />
                            </InputGroup>
                            <Select placeholder="Filtruj" maxW="150px" borderRadius="md">
                                <option value="active">Aktywni</option>
                                <option value="inactive">Nieaktywni</option>
                                <option value="draft">Szkice</option>
                            </Select>
                            <Button
                                colorScheme="brand"
                                onClick={handleAddNew}
                                leftIcon={<AddIcon boxSize={4} />}
                                borderRadius="md"
                                size="md"
                            >
                                Dodaj nowego
                            </Button>
                            <Button
                                colorScheme="blue"
                                onClick={handleCleanup}
                                leftIcon={<DeleteIcon boxSize={4} />}
                                borderRadius="md"
                                size="md"
                            >
                                Wyczyść listę
                            </Button>
                        </HStack>
                    </Flex>
                </CardHeader>
                <CardBody p={0}>
                    <TableContainer>
                        <Table variant="simple" size="md">
                            <Thead>
                                <Tr>
                                    <Th>Nazwa</Th>
                                    <Th>Status</Th>
                                    <Th>Częstotliwość sprawdzania</Th>
                                    <Th>Godziny pracy</Th>
                                    <Th textAlign="right">Akcje</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {agents && agents.length > 0 ? (
                                    agents.map((agent) => (
                                        <Tr key={agent.id} _hover={{ bg: 'gray.50' }}>
                                            <Td fontWeight="medium">{agent.name}</Td>
                                            <Td>
                                                <Badge 
                                                    colorScheme={agent.isActive ? 'green' : 'gray'} 
                                                    borderRadius="full" 
                                                    px={2}
                                                >
                                                    {agent.isActive ? 'Aktywny' : 'Nieaktywny'}
                                                </Badge>
                                            </Td>
                                            <Td>
                                                {agent.checkFrequency === 'custom'
                                                    ? `Co ${agent.customCheckInterval || 60} minut`
                                                    : agent.checkFrequency === 'live'
                                                    ? 'Na żywo'
                                                    : agent.checkFrequency === 'hourly'
                                                    ? 'Co godzinę'
                                                    : agent.checkFrequency && typeof agent.checkFrequency === 'string' && agent.checkFrequency.includes('min')
                                                    ? `Co ${agent.checkFrequency.replace('min', ' minut')}`
                                                    : agent.checkFrequency || 'Nie określono'}
                                            </Td>
                                            <Td>
                                                {agent.workingHours 
                                                    ? `${agent.workingHours.start || '08:00'} - ${agent.workingHours.end || '16:00'}`
                                                    : 'Nie określono'}
                                            </Td>
                                            <Td>
                                                <Flex justify="flex-end">
                                                    <Button
                                                        leftIcon={<HistoryIcon boxSize={4} />}
                                                        size="sm"
                                                        colorScheme="purple"
                                                        mr={2}
                                                        onClick={() => handleViewHistory(agent.id)}
                                                    >
                                                        Historia
                                                    </Button>
                                                    <Tooltip label="Edytuj" hasArrow>
                                                        <IconButton
                                                            icon={<EditIcon boxSize={4} />}
                                                            size="sm"
                                                            colorScheme="blue"
                                                            variant="ghost"
                                                            mr={2}
                                                            onClick={() => handleEdit(agent.id)}
                                                            aria-label="Edytuj"
                                                        />
                                                    </Tooltip>
                                                    <Tooltip label="Usuń" hasArrow>
                                                        <IconButton
                                                            icon={<DeleteIcon boxSize={4} />}
                                                            size="sm"
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            aria-label="Usuń"
                                                            onClick={() => handleDelete(agent.id)}
                                                        />
                                                    </Tooltip>
                                                </Flex>
                                            </Td>
                                        </Tr>
                                    ))
                                ) : (
                                    <Tr>
                                        <Td colSpan={5} textAlign="center">
                                            <Text>Brak agentów do wyświetlenia</Text>
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </CardBody>
            </Card>
        </VStack>
    );
};
