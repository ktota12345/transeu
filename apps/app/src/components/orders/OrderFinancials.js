import React from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Divider,
  Table,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { FiDollarSign, FiClock, FiTrendingUp } from 'react-icons/fi';

const OrderFinancials = ({ data }) => {
  if (!data) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
        <Flex align="center" mb={4}>
          <Icon as={FiDollarSign} mr={2} fontSize="xl" color="green.500" />
          <Heading as="h3" size="md">Informacje finansowe</Heading>
        </Flex>
        <Text>Brak danych finansowych.</Text>
      </Box>
    );
  }
  
  // Oblicz sumę kosztów dodatkowych
  const calculateTotalAdditionalCosts = () => {
    if (!data.additionalCosts || data.additionalCosts.length === 0) return 0;
    return data.additionalCosts.reduce((sum, cost) => sum + cost.value, 0);
  };
  
  const totalAdditionalCosts = calculateTotalAdditionalCosts();
  
  // Oblicz całkowite koszty
  const calculateTotalCosts = () => {
    let total = 0;
    if (data.fuelCost) total += data.fuelCost;
    if (data.driverCost) total += data.driverCost;
    total += totalAdditionalCosts;
    return total;
  };
  
  const totalCosts = calculateTotalCosts();
  
  // Oblicz rzeczywisty zysk
  const calculateActualProfit = () => {
    return data.value - totalCosts;
  };
  
  // Oblicz rzeczywistą marżę
  const calculateActualMargin = () => {
    const profit = calculateActualProfit();
    return data.value > 0 ? (profit / data.value * 100).toFixed(1) : 0;
  };
  
  const actualProfit = calculateActualProfit();
  const actualMargin = calculateActualMargin();
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" h="100%">
      <Flex align="center" mb={4}>
        <Icon as={FiDollarSign} mr={2} fontSize="xl" color="green.500" />
        <Heading as="h3" size="md">Informacje finansowe</Heading>
      </Flex>
      
      <StatGroup mb={4}>
        <Stat>
          <StatLabel>Wartość zlecenia</StatLabel>
          <StatNumber>{data.value} {data.currency}</StatNumber>
          <StatHelpText>
            <Flex align="center">
              <Icon as={FiTrendingUp} mr={1} />
              {data.valuePerKm ? `${data.valuePerKm} ${data.currency}/km` : 'Brak danych'}
            </Flex>
          </StatHelpText>
        </Stat>
      </StatGroup>
      
      <Divider my={4} />
      
      <TableContainer>
        <Table variant="simple" size="sm">
          <Tbody>
            <Tr>
              <Th>Stawka za km</Th>
              <Td>{data.ratePerKm ? `${data.ratePerKm} ${data.currency}/km` : '-'}</Td>
            </Tr>
            <Tr>
              <Th>Dystans</Th>
              <Td>{data.distance ? `${data.distance} km` : '-'}</Td>
            </Tr>
            <Tr>
              <Th>Termin płatności</Th>
              <Td>
                <Flex align="center">
                  <Icon as={FiClock} mr={2} />
                  {data.paymentTerm ? `${data.paymentTerm} ${data.paymentTerm > 1 ? 'dni' : 'dzień'}` : '-'}
                </Flex>
              </Td>
            </Tr>
            <Tr>
              <Th>Koszt paliwa</Th>
              <Td>{data.fuelCost ? `${data.fuelCost} ${data.currency}` : '-'}</Td>
            </Tr>
            <Tr>
              <Th>Koszt kierowcy</Th>
              <Td>{data.driverCost ? `${data.driverCost} ${data.currency}` : '-'}</Td>
            </Tr>
            <Tr>
              <Th>Dodatkowe koszty</Th>
              <Td>
                {data.additionalCosts && data.additionalCosts.length > 0 
                  ? (
                    <div>
                      {data.additionalCosts.map((cost, index) => (
                        <Text key={index}>
                          {cost.name}: {cost.value} {cost.currency}
                        </Text>
                      ))}
                      <Text fontWeight="bold">
                        Razem: {totalAdditionalCosts} {data.currency}
                      </Text>
                    </div>
                  ) 
                  : '-'}
              </Td>
            </Tr>
            <Tr>
              <Th>Całkowite koszty</Th>
              <Td>
                <Text fontWeight="bold">
                  {totalCosts} {data.currency}
                </Text>
              </Td>
            </Tr>
            <Tr>
              <Th>Rzeczywisty zysk</Th>
              <Td>
                <Text fontWeight="bold" color="green.500">
                  {actualProfit} {data.currency}
                </Text>
              </Td>
            </Tr>
            <Tr>
              <Th>Rzeczywista marża</Th>
              <Td>
                <Text fontWeight="bold">
                  {actualMargin}%
                </Text>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OrderFinancials;
