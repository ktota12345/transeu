import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Grid,
  GridItem,
  Icon,
  Divider,
  Tooltip,
} from '@chakra-ui/react';
import { FiTruck, FiCalendar, FiMapPin, FiUser, FiPackage } from 'react-icons/fi';
import { RiRobotLine } from 'react-icons/ri';

// Komponent dla statusu zlecenia
const OrderStatusBadge = ({ status }) => {
  let colorScheme = 'gray';
  let label = 'Nieznany';

  switch (status) {
    case 'new':
      colorScheme = 'blue';
      label = 'Nowe';
      break;
    case 'negotiating':
      colorScheme = 'orange';
      label = 'W negocjacji';
      break;
    case 'operator_assigned':
      colorScheme = 'purple';
      label = 'Operator';
      break;
    case 'accepted':
      colorScheme = 'green';
      label = 'Zaakceptowane';
      break;
    case 'rejected':
      colorScheme = 'red';
      label = 'Odrzucone';
      break;
    case 'expired':
      colorScheme = 'gray';
      label = 'Wygasłe';
      break;
    default:
      break;
  }

  return (
    <Badge colorScheme={colorScheme} borderRadius="full" px={1} py={0} fontSize="xs">
      {label}
    </Badge>
  );
};

const OrderHeader = ({ order }) => {
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
  
  return (
    <Box p={2} borderWidth="1px" borderRadius="lg" bg="white" mb={2}>
      <Flex justify="space-between" align="center" mb={2} flexWrap="wrap" gap={1}>
        <Box>
          <Heading as="h2" size="md">
            Zlecenie #{order.id}
          </Heading>
          <Flex align="center">
            {order.assignedAgentType === 'automation' ? (
              <>
                <Icon as={RiRobotLine} mr={1} color="blue.500" boxSize="0.9em" />
                <Tooltip label="Agent automatyzujący" placement="top">
                  <Text color="blue.600" fontSize="sm" fontWeight="medium">
                    {order.assignedAgentName || 'Agent Automatyzacji'}
                  </Text>
                </Tooltip>
              </>
            ) : (
              <>
                <Icon as={FiUser} mr={1} color="gray.500" size="sm" />
                <Text color="gray.600" fontSize="sm">{order.contractorName}</Text>
              </>
            )}
          </Flex>
        </Box>
        
        <Flex align="center" gap={2}>
          <OrderStatusBadge status={order.status} />
          <Text fontSize="xs" color="gray.500">
            Utworzono: {formatDate(order.createdAt)}
          </Text>
        </Flex>
      </Flex>
      
      <Divider my={2} />
      
      <Grid templateColumns="repeat(12, 1fr)" gap={2}>
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Flex align="center" mb={1}>
            <Icon as={FiMapPin} mr={1} color="blue.500" boxSize="0.9em" />
            <Text fontWeight="bold" fontSize="sm">Miejsce załadunku</Text>
          </Flex>
          <Text fontSize="sm">{order.pickup?.location?.address || '-'}</Text>
          <Text fontSize="xs" color="gray.600">
            {formatDate(order.pickup?.date)}
          </Text>
        </GridItem>
        
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Flex align="center" mb={1}>
            <Icon as={FiMapPin} mr={1} color="green.500" boxSize="0.9em" />
            <Text fontWeight="bold" fontSize="sm">Miejsce rozładunku</Text>
          </Flex>
          <Text fontSize="sm">{order.delivery?.location?.address || '-'}</Text>
          <Text fontSize="xs" color="gray.600">
            {formatDate(order.delivery?.date)}
          </Text>
        </GridItem>
        
        <GridItem colSpan={{ base: 12, md: 4 }}>
          <Flex align="center" mb={1}>
            <Icon as={FiPackage} mr={1} color="orange.500" boxSize="0.9em" />
            <Text fontWeight="bold" fontSize="sm">Ładunek</Text>
          </Flex>
          <Text fontSize="sm">{order.cargo?.type || '-'}</Text>
          <Text fontSize="xs" color="gray.600">
            {order.cargo?.weight ? `${order.cargo.weight} kg` : '-'}
          </Text>
        </GridItem>
        
        <GridItem colSpan={{ base: 12, md: 4 }}>
          <Flex align="center" mb={1}>
            <Icon as={FiTruck} mr={1} color="purple.500" boxSize="0.9em" />
            <Text fontWeight="bold" fontSize="sm">Pojazd</Text>
          </Flex>
          <Text fontSize="sm">{order.vehicle?.type || '-'}</Text>
          <Text fontSize="xs" color="gray.600">
            {order.vehicle?.requirements || '-'}
          </Text>
        </GridItem>
        
        <GridItem colSpan={{ base: 12, md: 4 }}>
          <Flex align="center" mb={1}>
            <Icon as={FiCalendar} mr={1} color="red.500" boxSize="0.9em" />
            <Text fontWeight="bold" fontSize="sm">Termin ważności</Text>
          </Flex>
          <Text fontSize="sm">{formatDate(order.expiresAt)}</Text>
          {order.expiresAt && new Date(order.expiresAt) < new Date() && (
            <Badge colorScheme="red" mt={0} fontSize="xs">Wygasło</Badge>
          )}
        </GridItem>
      </Grid>
    </Box>
  );
};

export default OrderHeader;
