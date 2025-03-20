import React from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Icon,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
} from '@chakra-ui/react';
import { FiTrendingUp, FiThumbsUp, FiThumbsDown, FiAlertTriangle } from 'react-icons/fi';

const OrderProfitability = ({ score }) => {
  // Określenie koloru i statusu na podstawie wyniku
  const getColorAndStatus = (score) => {
    if (!score && score !== 0) {
      return { color: 'gray', status: 'Brak danych', icon: FiAlertTriangle };
    }
    
    if (score >= 80) {
      return { color: 'green', status: 'Bardzo dobra', icon: FiThumbsUp };
    } else if (score >= 60) {
      return { color: 'teal', status: 'Dobra', icon: FiThumbsUp };
    } else if (score >= 40) {
      return { color: 'yellow', status: 'Średnia', icon: FiAlertTriangle };
    } else if (score >= 20) {
      return { color: 'orange', status: 'Słaba', icon: FiAlertTriangle };
    } else {
      return { color: 'red', status: 'Bardzo słaba', icon: FiThumbsDown };
    }
  };
  
  const { color, status, icon } = getColorAndStatus(score);
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" h="100%">
      <Flex align="center" mb={4}>
        <Icon as={FiTrendingUp} mr={2} fontSize="xl" color="blue.500" />
        <Heading as="h3" size="md">Opłacalność zlecenia</Heading>
      </Flex>
      
      <Flex direction="column" align="center" justify="center" py={4}>
        <CircularProgress 
          value={score || 0} 
          color={`${color}.500`} 
          size="120px" 
          thickness="8px"
        >
          <CircularProgressLabel fontWeight="bold" fontSize="xl">
            {score !== undefined && score !== null ? `${score}%` : 'N/A'}
          </CircularProgressLabel>
        </CircularProgress>
        
        <Stat textAlign="center" mt={4}>
          <StatLabel>Opłacalność</StatLabel>
          <StatNumber color={`${color}.500`}>{status}</StatNumber>
          <StatHelpText>
            <Flex align="center" justify="center">
              <Icon as={icon} mr={1} />
              {score >= 60 ? 'Rekomendowane' : score >= 40 ? 'Neutralne' : 'Nierekomendowane'}
            </Flex>
          </StatHelpText>
        </Stat>
      </Flex>
      
      <Divider my={4} />
      
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb={1}>Składowe oceny:</Text>
        
        <Flex justify="space-between" align="center" mb={1}>
          <Text fontSize="sm">Stawka</Text>
          <Text fontSize="sm" fontWeight="medium">30%</Text>
        </Flex>
        <Progress value={30} size="sm" colorScheme="green" mb={3} borderRadius="full" />
        
        <Flex justify="space-between" align="center" mb={1}>
          <Text fontSize="sm">Dystans</Text>
          <Text fontSize="sm" fontWeight="medium">25%</Text>
        </Flex>
        <Progress value={25} size="sm" colorScheme="blue" mb={3} borderRadius="full" />
        
        <Flex justify="space-between" align="center" mb={1}>
          <Text fontSize="sm">Termin płatności</Text>
          <Text fontSize="sm" fontWeight="medium">15%</Text>
        </Flex>
        <Progress value={15} size="sm" colorScheme="yellow" mb={3} borderRadius="full" />
        
        <Flex justify="space-between" align="center" mb={1}>
          <Text fontSize="sm">Kontrahent</Text>
          <Text fontSize="sm" fontWeight="medium">20%</Text>
        </Flex>
        <Progress value={20} size="sm" colorScheme="purple" mb={3} borderRadius="full" />
        
        <Flex justify="space-between" align="center" mb={1}>
          <Text fontSize="sm">Inne czynniki</Text>
          <Text fontSize="sm" fontWeight="medium">10%</Text>
        </Flex>
        <Progress value={10} size="sm" colorScheme="gray" mb={3} borderRadius="full" />
      </Box>
    </Box>
  );
};

export default OrderProfitability;
