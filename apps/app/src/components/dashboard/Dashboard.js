import React from 'react';
import {
    Box,
    Grid,
    GridItem,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Card,
    CardBody,
    CardHeader,
    Heading,
    Text,
    Flex,
    Icon,
    useColorModeValue
} from '@chakra-ui/react';
import { FiUsers, FiTruck, FiCalendar, FiDollarSign } from 'react-icons/fi';

const StatCard = ({ title, value, icon, change, helpText, colorScheme }) => {
    const bgColor = useColorModeValue('white', 'gray.700');
    const iconColor = useColorModeValue(`${colorScheme}.500`, `${colorScheme}.300`);
    
    return (
        <Card shadow="md" bg={bgColor}>
            <CardBody>
                <Flex justifyContent="space-between" alignItems="center">
                    <Stat>
                        <StatLabel fontSize="sm" fontWeight="medium" color="gray.500">{title}</StatLabel>
                        <StatNumber fontSize="3xl" fontWeight="bold">{value}</StatNumber>
                        {change && (
                            <StatHelpText>
                                <StatArrow type={change > 0 ? 'increase' : 'decrease'} />
                                {Math.abs(change)}% {helpText}
                            </StatHelpText>
                        )}
                    </Stat>
                    <Icon as={icon} boxSize={10} color={iconColor} />
                </Flex>
            </CardBody>
        </Card>
    );
};

const Dashboard = () => {
    return (
        <Box p={6}>
            <Heading size="lg" mb={6}>Dashboard</Heading>
            
            {/* Statystyki */}
            <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6} mb={8}>
                <GridItem>
                    <StatCard 
                        title="Aktywni agenci" 
                        value="24" 
                        icon={FiUsers} 
                        change={12} 
                        helpText="od ostatniego miesiąca" 
                        colorScheme="blue"
                    />
                </GridItem>
                <GridItem>
                    <StatCard 
                        title="Zlecenia w trakcie" 
                        value="156" 
                        icon={FiTruck} 
                        change={8} 
                        helpText="od ostatniego tygodnia" 
                        colorScheme="green"
                    />
                </GridItem>
                <GridItem>
                    <StatCard 
                        title="Zaplanowane zlecenia" 
                        value="38" 
                        icon={FiCalendar} 
                        change={-5} 
                        helpText="od ostatniego tygodnia" 
                        colorScheme="orange"
                    />
                </GridItem>
                <GridItem>
                    <StatCard 
                        title="Przychód (PLN)" 
                        value="128,450" 
                        icon={FiDollarSign} 
                        change={22} 
                        helpText="od ostatniego miesiąca" 
                        colorScheme="purple"
                    />
                </GridItem>
            </Grid>
            
            {/* Ostatnie aktywności */}
            <Grid templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(2, 1fr)' }} gap={6}>
                <GridItem>
                    <Card shadow="md" bg={useColorModeValue('white', 'gray.700')}>
                        <CardHeader pb={2}>
                            <Heading size="md">Ostatnie aktywności agentów</Heading>
                        </CardHeader>
                        <CardBody>
                            {[1, 2, 3, 4, 5].map((item) => (
                                <Box key={item} p={3} borderBottom="1px solid" borderColor="gray.100">
                                    <Flex justifyContent="space-between">
                                        <Text fontWeight="medium">Agent #{item}</Text>
                                        <Text fontSize="sm" color="gray.500">Dzisiaj, 14:3{item}</Text>
                                    </Flex>
                                    <Text fontSize="sm" mt={1}>
                                        {item % 2 === 0 
                                            ? `Zakończono negocjacje zlecenia #${item}00${item}` 
                                            : `Rozpoczęto nowe zlecenie #${item}00${item + 1}`}
                                    </Text>
                                </Box>
                            ))}
                        </CardBody>
                    </Card>
                </GridItem>
                
                <GridItem>
                    <Card shadow="md" bg={useColorModeValue('white', 'gray.700')}>
                        <CardHeader pb={2}>
                            <Heading size="md">Wydajność agentów</Heading>
                        </CardHeader>
                        <CardBody>
                            {[1, 2, 3, 4, 5].map((item) => (
                                <Box key={item} p={3} borderBottom="1px solid" borderColor="gray.100">
                                    <Flex justifyContent="space-between" alignItems="center">
                                        <Text fontWeight="medium">Agent #{item}</Text>
                                        <Flex alignItems="center">
                                            <Text mr={2}>{85 + item}%</Text>
                                            <Box 
                                                w="100px" 
                                                h="8px" 
                                                bg="gray.100" 
                                                borderRadius="full"
                                            >
                                                <Box 
                                                    w={`${85 + item}%`} 
                                                    h="100%" 
                                                    bg={`${item % 2 === 0 ? 'green' : 'blue'}.500`} 
                                                    borderRadius="full"
                                                />
                                            </Box>
                                        </Flex>
                                    </Flex>
                                    <Text fontSize="sm" mt={1} color="gray.500">
                                        {item * 12} zakończonych zleceń
                                    </Text>
                                </Box>
                            ))}
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>
        </Box>
    );
};

export default Dashboard;
