import React from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Icon,
  Tooltip,
  Text
} from '@chakra-ui/react';
import { FiTruck, FiCheck, FiX, FiSearch, FiTrendingUp, FiTrendingDown, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import { InfoIcon } from '@chakra-ui/icons';

const AgentHistoryStats = ({ history }) => {
  if (!history || history.length === 0) {
    return null;
  }
  
  // Oblicz statystyki
  const calculateStats = () => {
    const stats = {
      totalSearches: 0,
      totalInitialOffers: 0,
      totalProcessedOffers: 0,
      totalAcceptedOffers: 0,
      totalRejectedOffers: 0,
      acceptanceRatio: 0,
      lastSearchTimestamp: null,
      averageOffersPerSearch: 0
    };
    
    const searchEntries = history.filter(entry => entry.type === 'search');
    
    if (searchEntries.length > 0) {
      stats.totalSearches = searchEntries.length;
      
      searchEntries.forEach(entry => {
        stats.totalInitialOffers += entry.initialOffers?.length || 0;
        stats.totalProcessedOffers += entry.processedOffers?.length || 0;
        stats.totalAcceptedOffers += entry.acceptedOffersCount || 0;
      });
      
      stats.totalRejectedOffers = stats.totalProcessedOffers - stats.totalAcceptedOffers;
      stats.acceptanceRatio = stats.totalProcessedOffers > 0 
        ? (stats.totalAcceptedOffers / stats.totalProcessedOffers) * 100 
        : 0;
      stats.averageOffersPerSearch = stats.totalSearches > 0 
        ? stats.totalInitialOffers / stats.totalSearches 
        : 0;
      
      // Znajdź datę ostatniego wyszukiwania
      const timestamps = searchEntries.map(entry => new Date(entry.timestamp).getTime());
      if (timestamps.length > 0) {
        stats.lastSearchTimestamp = Math.max(...timestamps);
      }
    }
    
    return stats;
  };
  
  const stats = calculateStats();
  
  return (
    <Box>
      <Heading size="md" mb={4}>Statystyki</Heading>
      
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={5}>
        <Stat 
          p={3} 
          shadow="sm" 
          border="1px" 
          borderColor="gray.200" 
          borderRadius="md"
          bg="white"
        >
          <Flex alignItems="center">
            <Box
              p={2}
              bg="blue.50"
              borderRadius="full"
              mr={3}
            >
              <Icon as={FiSearch} w={6} h={6} color="blue.500" />
            </Box>
            <Box>
              <StatLabel>Liczba wyszukiwań</StatLabel>
              <StatNumber>{stats.totalSearches}</StatNumber>
              {stats.lastSearchTimestamp && (
                <StatHelpText>
                  Ostatnie: {new Date(stats.lastSearchTimestamp).toLocaleDateString()}
                </StatHelpText>
              )}
            </Box>
          </Flex>
        </Stat>
        
        <Stat 
          p={3} 
          shadow="sm" 
          border="1px" 
          borderColor="gray.200" 
          borderRadius="md"
          bg="white"
        >
          <Flex alignItems="center">
            <Box
              p={2}
              bg="purple.50"
              borderRadius="full"
              mr={3}
            >
              <Icon as={FiTruck} w={6} h={6} color="purple.500" />
            </Box>
            <Box>
              <StatLabel>Wszystkie oferty</StatLabel>
              <StatNumber>{stats.totalInitialOffers}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {stats.averageOffersPerSearch.toFixed(1)} na wyszukiwanie
              </StatHelpText>
            </Box>
          </Flex>
        </Stat>
        
        <Stat 
          p={3} 
          shadow="sm" 
          border="1px" 
          borderColor="gray.200" 
          borderRadius="md"
          bg="white"
        >
          <Flex alignItems="center">
            <Box
              p={2}
              bg="green.50"
              borderRadius="full"
              mr={3}
            >
              <Icon as={FiCheck} w={6} h={6} color="green.500" />
            </Box>
            <Box>
              <StatLabel>Oferty zaakceptowane</StatLabel>
              <StatNumber>{stats.totalAcceptedOffers}</StatNumber>
              <StatHelpText>
                <Tooltip hasArrow label="Stosunek ofert zaakceptowanych do wszystkich ocenionych">
                  <Text display="inline">
                    <InfoIcon mb={1} mr={1} /> 
                    {stats.acceptanceRatio.toFixed(1)}% ofert
                  </Text>
                </Tooltip>
              </StatHelpText>
            </Box>
          </Flex>
        </Stat>
        
        <Stat 
          p={3} 
          shadow="sm" 
          border="1px" 
          borderColor="gray.200" 
          borderRadius="md"
          bg="white"
        >
          <Flex alignItems="center">
            <Box
              p={2}
              bg="red.50"
              borderRadius="full"
              mr={3}
            >
              <Icon as={FiX} w={6} h={6} color="red.500" />
            </Box>
            <Box>
              <StatLabel>Oferty odrzucone</StatLabel>
              <StatNumber>{stats.totalRejectedOffers}</StatNumber>
              <StatHelpText>
                {stats.totalProcessedOffers > 0
                  ? (100 - stats.acceptanceRatio).toFixed(1)
                  : 0}% ofert
              </StatHelpText>
            </Box>
          </Flex>
        </Stat>
      </SimpleGrid>
    </Box>
  );
};

export default AgentHistoryStats;
