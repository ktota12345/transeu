import React, { useState } from 'react';
import {
  Box,
  Heading,
  Button,
  Text,
  Flex,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  SimpleGrid,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  Icon,
  HStack,
  Link
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { FiTruck, FiCheck, FiExternalLink } from 'react-icons/fi';

// Komponent do wyświetlania pojedynczej oferty
const OfferItem = ({ offer, isProfitabilityScored = false }) => {
  return (
    <Box p={4} borderWidth="1px" borderRadius="md" mb={3} position="relative">
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="sm">{offer.id}</Heading>
          <Text fontSize="sm" mt={1}>
            {offer.loadingPlace?.address?.city || 
             (offer.loadingPlaces && offer.loadingPlaces.length > 0 ? offer.loadingPlaces[0].address?.city : 'N/A')} 
            → 
            {offer.unloadingPlace?.address?.city || 
             (offer.loadingPlaces && offer.loadingPlaces.length > 1 ? 
              offer.loadingPlaces.find(p => p.loadingType === 'UNLOADING')?.address?.city : 'N/A')}
          </Text>
        </Box>
        <Box>
          <Text fontWeight="bold">
            {offer.price?.amount ? `${offer.price.amount} ${offer.price.currency || 'EUR'}` : 'Cena: N/A'}
          </Text>
          <Text fontSize="sm">{offer.distance_km || offer.distance?.value || 'N/A'} km</Text>
        </Box>
      </Flex>
      
      {offer.freightDescription && (
        <Text fontSize="sm" mt={2}>
          <strong>Opis:</strong> {offer.freightDescription}
        </Text>
      )}
      
      {offer.deeplink && (
        <Link href={offer.deeplink} isExternal mt={2} display="inline-flex" alignItems="center" fontSize="sm" color="blue.500">
          Zobacz w Timocom <Icon as={FiExternalLink} ml={1} />
        </Link>
      )}
      
      {isProfitabilityScored && offer.profitability && (
        <Box mt={3}>
          <Text fontSize="sm" fontWeight="bold" mb={1}>
            Profitability Score: {offer.profitability.score}/100
          </Text>
          <Progress 
            value={offer.profitability.score} 
            colorScheme={offer.profitability.score >= 70 ? "green" : offer.profitability.score >= 50 ? "yellow" : "red"}
            size="sm"
            borderRadius="md"
          />
          
          <SimpleGrid columns={3} spacing={2} mt={2}>
            <Stat size="sm">
              <StatLabel fontSize="xs">Zysk</StatLabel>
              <StatNumber fontSize="sm">{offer.profitability.profit?.toFixed(2) || 0} PLN</StatNumber>
            </Stat>
            <Stat size="sm">
              <StatLabel fontSize="xs">Przychód</StatLabel>
              <StatNumber fontSize="sm">{offer.profitability.revenue?.toFixed(2) || 0} PLN</StatNumber>
            </Stat>
            <Stat size="sm">
              <StatLabel fontSize="xs">Koszty</StatLabel>
              <StatNumber fontSize="sm">{offer.profitability.cost?.toFixed(2) || 0} PLN</StatNumber>
            </Stat>
          </SimpleGrid>
        </Box>
      )}
      
      {isProfitabilityScored && (
        <Badge 
          position="absolute" 
          top={2} 
          right={2}
          colorScheme={offer.profitability && offer.profitability.score >= 70 ? "green" : "red"}
        >
          {offer.profitability && offer.profitability.score >= 70 ? "Akceptowalna" : "Odrzucona"}
        </Badge>
      )}
    </Box>
  );
};

// Komponent do wyświetlania ofert Timocom
const TimocomSearchEntry = ({ entry, expandedItems, toggleItem }) => {
  return (
    <AccordionItem key={entry.id} mb={4} border="1px solid" borderColor="gray.200" borderRadius="md">
      <h2>
        <AccordionButton p={4} _expanded={{ bg: 'blue.50' }}>
          <Box flex="1" textAlign="left">
            <Flex justify="space-between" align="center">
              <Heading size="sm">
                Wyszukiwanie Timocom z {new Date(entry.timestamp).toLocaleString()}
              </Heading>
              <HStack spacing={4}>
                <Badge colorScheme={entry.status === 'success' ? 'green' : 'red'}>
                  {entry.status === 'success' ? 'Sukces' : 'Błąd'}
                </Badge>
                <Badge colorScheme="blue">
                  <Icon as={FiTruck} mr={1} />
                  {entry.offers?.length || 0} ofert
                </Badge>
              </HStack>
            </Flex>
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={4}>
        <Box mb={4}>
          <Heading size="xs" mb={2}>Szczegóły</Heading>
          <Text fontSize="sm">{entry.details}</Text>
          {entry.errorDetails && (
            <Text color="red.500" fontSize="sm" mt={2}>{entry.errorDetails}</Text>
          )}
        </Box>
        
        {entry.offers && entry.offers.length > 0 && (
          <>
            <Divider my={4} />
            
            <Box>
              <Flex justify="space-between" align="center" mb={3}>
                <Heading size="xs">Znalezione oferty ({entry.offers.length})</Heading>
                <Button 
                  size="xs" 
                  rightIcon={expandedItems[`${entry.id}-offers`] ? <ChevronDownIcon /> : <ChevronUpIcon />}
                  onClick={() => toggleItem(`${entry.id}-offers`)}
                >
                  {expandedItems[`${entry.id}-offers`] ? 'Zwiń' : 'Rozwiń'}
                </Button>
              </Flex>
              
              {expandedItems[`${entry.id}-offers`] && (
                <Box maxHeight="300px" overflowY="auto" mb={4}>
                  {entry.offers.map(offer => (
                    <OfferItem key={offer.id} offer={offer} />
                  ))}
                </Box>
              )}
            </Box>
          </>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

// Komponent do wyświetlania historii agenta
const AgentHistorySearch = ({ history, filter = 'all' }) => {
  const [expandedItems, setExpandedItems] = useState({});
  
  console.log('AgentHistorySearch - otrzymana historia:', history);
  console.log('AgentHistorySearch - aktywny filtr:', filter);
  
  if (!history || history.length === 0) {
    return (
      <Box p={5} textAlign="center">
        <Text>Brak historii wyszukiwań dla tego agenta.</Text>
      </Box>
    );
  }
  
  // Filtrujemy historię zgodnie z parametrem filter
  const filteredHistory = history.filter(entry => {
    console.log('Sprawdzam wpis historii:', entry);
    if (filter === 'all') return true;
    if (filter === 'search') return entry.type === 'searchOffers';
    if (filter === 'order') return entry.type === 'order';
    if (filter === 'system') return entry.type === 'system';
    return true;
  });
  
  console.log('AgentHistorySearch - przefiltrowana historia:', filteredHistory);
  
  if (filteredHistory.length === 0) {
    return (
      <Box p={5} textAlign="center">
        <Text>Brak wpisów historii dla wybranego filtra.</Text>
      </Box>
    );
  }
  
  const toggleItem = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  return (
    <Box>
      <Accordion allowMultiple>
        {filteredHistory.map((entry) => {
          // Sprawdzamy typ wpisu historii
          if (entry.type === 'searchOffers') {
            // Renderujemy wpis historii wyszukiwania Timocom
            return (
              <TimocomSearchEntry 
                key={entry.id} 
                entry={entry} 
                expandedItems={expandedItems} 
                toggleItem={toggleItem} 
              />
            );
          } else {
            // Renderujemy standardowy wpis historii (stara implementacja)
            return (
              <AccordionItem key={entry.id} mb={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                <h2>
                  <AccordionButton p={4} _expanded={{ bg: 'blue.50' }}>
                    <Box flex="1" textAlign="left">
                      <Flex justify="space-between" align="center">
                        <Heading size="sm">
                          {entry.type === 'order' ? 'Zlecenie' : 'Wpis'} z {new Date(entry.timestamp).toLocaleString()}
                        </Heading>
                        <HStack spacing={4}>
                          {entry.initialOffers && (
                            <Badge colorScheme="blue">
                              <Icon as={FiTruck} mr={1} />
                              {entry.initialOffers.length} ofert
                            </Badge>
                          )}
                          {entry.acceptedOffersCount !== undefined && (
                            <Badge colorScheme="green">
                              <Icon as={FiCheck} mr={1} />
                              {entry.acceptedOffersCount} zaakceptowanych
                            </Badge>
                          )}
                        </HStack>
                      </Flex>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  {/* Stara implementacja dla innych typów wpisów */}
                  {entry.searchParams && (
                    <Box mb={4}>
                      <Heading size="xs" mb={2}>Parametry wyszukiwania</Heading>
                      <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                        <Box p={2} bg="gray.50" borderRadius="md">
                          <Text fontSize="xs" fontWeight="bold">Agent</Text>
                          <Text fontSize="sm">{entry.searchParams?.agentConfig?.name || 'N/A'}</Text>
                        </Box>
                        {entry.searchParams?.agentConfig?.selectedLogisticsBase && (
                          <Box p={2} bg="gray.50" borderRadius="md">
                            <Text fontSize="xs" fontWeight="bold">Baza logistyczna</Text>
                            <Text fontSize="sm">ID: {entry.searchParams.agentConfig.selectedLogisticsBase}</Text>
                          </Box>
                        )}
                        {entry.searchParams?.agentConfig?.customLogisticsPoint && (
                          <Box p={2} bg="gray.50" borderRadius="md">
                            <Text fontSize="xs" fontWeight="bold">Punkt niestandardowy</Text>
                            <Text fontSize="sm">{entry.searchParams.agentConfig.customLogisticsPoint.name || 'Punkt niestandardowy'}</Text>
                          </Box>
                        )}
                      </SimpleGrid>
                    </Box>
                  )}
                  
                  {entry.initialOffers && entry.initialOffers.length > 0 && (
                    <>
                      <Divider my={4} />
                      
                      <Box>
                        <Flex justify="space-between" align="center" mb={3}>
                          <Heading size="xs">Oferty przed oceną rentowności</Heading>
                          <Button 
                            size="xs" 
                            rightIcon={expandedItems[`${entry.id}-initial`] ? <ChevronDownIcon /> : <ChevronUpIcon />}
                            onClick={() => toggleItem(`${entry.id}-initial`)}
                          >
                            {expandedItems[`${entry.id}-initial`] ? 'Zwiń' : 'Rozwiń'}
                          </Button>
                        </Flex>
                        
                        {expandedItems[`${entry.id}-initial`] && (
                          <Box maxHeight="300px" overflowY="auto" mb={4}>
                            {entry.initialOffers.map(offer => (
                              <OfferItem key={offer.id} offer={offer} />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </>
                  )}
                  
                  {entry.processedOffers && entry.processedOffers.length > 0 && (
                    <>
                      <Divider my={4} />
                      
                      <Box>
                        <Flex justify="space-between" align="center" mb={3}>
                          <Heading size="xs">Oferty po ocenie rentowności</Heading>
                          <Button 
                            size="xs" 
                            rightIcon={expandedItems[`${entry.id}-processed`] ? <ChevronDownIcon /> : <ChevronUpIcon />}
                            onClick={() => toggleItem(`${entry.id}-processed`)}
                          >
                            {expandedItems[`${entry.id}-processed`] ? 'Zwiń' : 'Rozwiń'}
                          </Button>
                        </Flex>
                        
                        {expandedItems[`${entry.id}-processed`] && (
                          <Box maxHeight="300px" overflowY="auto">
                            {entry.processedOffers.map(offer => (
                              <OfferItem key={offer.id} offer={offer} isProfitabilityScored={true} />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </>
                  )}
                </AccordionPanel>
              </AccordionItem>
            );
          }
        })}
      </Accordion>
    </Box>
  );
};

export default AgentHistorySearch;
