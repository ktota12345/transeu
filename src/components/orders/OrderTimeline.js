import React from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Icon,
  VStack,
  HStack,
  Circle,
  Badge,
} from '@chakra-ui/react';
import { 
  FiClock, 
  FiCheck, 
  FiX, 
  FiMessageSquare, 
  FiUser, 
  FiEdit, 
  FiTruck,
  FiAlertTriangle,
  FiCalendar
} from 'react-icons/fi';

const OrderTimeline = ({ events = [], currentStatus }) => {
  // Jeśli nie ma wydarzeń, pokaż informację
  if (!events || events.length === 0) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
        <Flex align="center" mb={4}>
          <Icon as={FiClock} mr={2} fontSize="xl" color="purple.500" />
          <Heading as="h3" size="md">Historia zlecenia</Heading>
        </Flex>
        <Text>Brak danych o historii zlecenia.</Text>
      </Box>
    );
  }
  
  // Formatowanie daty
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Określenie ikony i koloru dla typu wydarzenia
  const getIconAndColor = (type) => {
    switch (type) {
      case 'created':
        return { icon: FiCalendar, color: 'blue' };
      case 'message':
        return { icon: FiMessageSquare, color: 'teal' };
      case 'status_change':
        return { icon: FiEdit, color: 'orange' };
      case 'accepted':
        return { icon: FiCheck, color: 'green' };
      case 'rejected':
        return { icon: FiX, color: 'red' };
      case 'operator_assigned':
        return { icon: FiUser, color: 'purple' };
      case 'agent_assigned':
        return { icon: FiTruck, color: 'cyan' };
      case 'expired':
        return { icon: FiAlertTriangle, color: 'gray' };
      default:
        return { icon: FiClock, color: 'gray' };
    }
  };
  
  // Sortowanie wydarzeń od najnowszych do najstarszych
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
      <Flex align="center" mb={4}>
        <Icon as={FiClock} mr={2} fontSize="xl" color="purple.500" />
        <Heading as="h3" size="md">Historia zlecenia</Heading>
      </Flex>
      
      <VStack spacing={0} align="stretch">
        {sortedEvents.map((event, index) => {
          const { icon, color } = getIconAndColor(event.type);
          const isLast = index === sortedEvents.length - 1;
          
          return (
            <Box key={index} position="relative">
              <HStack spacing={4} align="flex-start">
                <Flex direction="column" align="center">
                  <Circle size="40px" bg={`${color}.100`} color={`${color}.500`}>
                    <Icon as={icon} fontSize="lg" />
                  </Circle>
                  {!isLast && (
                    <Box
                      position="absolute"
                      top="40px"
                      left="20px"
                      width="2px"
                      height="calc(100% - 40px)"
                      bg={`${color}.100`}
                    />
                  )}
                </Flex>
                
                <Box flex="1" pb={isLast ? 0 : 6}>
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text fontWeight="bold">{event.title}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {formatDate(event.timestamp)}
                    </Text>
                  </Flex>
                  
                  {event.description && (
                    <Text color="gray.600" fontSize="sm">
                      {event.description}
                    </Text>
                  )}
                  
                  {event.user && (
                    <Flex align="center" mt={1}>
                      <Icon as={FiUser} fontSize="xs" mr={1} color="gray.500" />
                      <Text fontSize="sm" color="gray.500">
                        {event.user}
                      </Text>
                    </Flex>
                  )}
                  
                  {event.status && (
                    <Badge mt={1} colorScheme={
                      event.status === 'accepted' ? 'green' :
                      event.status === 'rejected' ? 'red' :
                      event.status === 'operator_assigned' ? 'purple' :
                      event.status === 'agent_assigned' ? 'cyan' :
                      event.status === 'negotiating' ? 'orange' :
                      event.status === 'expired' ? 'gray' :
                      'blue'
                    }>
                      {event.status === 'accepted' ? 'Zaakceptowane' :
                       event.status === 'rejected' ? 'Odrzucone' :
                       event.status === 'operator_assigned' ? 'Przekazane operatorowi' :
                       event.status === 'agent_assigned' ? 'Przekazane agentowi' :
                       event.status === 'negotiating' ? 'W negocjacji' :
                       event.status === 'expired' ? 'Wygasłe' :
                       event.status === 'new' ? 'Nowe' : event.status}
                    </Badge>
                  )}
                </Box>
              </HStack>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default OrderTimeline;
