import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  useToast,
  Flex,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  VStack,
  IconButton,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Code,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowBackIcon, QuestionOutlineIcon, SearchIcon } from '@chakra-ui/icons';
import {
  fetchAgentHistory,
  clearAgentHistory,
  selectAgentHistory,
  selectAgentHistoryStatus,
  selectAgentHistoryError
} from '../../features/agentHistory/agentHistorySlice';
import AgentHistorySearch from './AgentHistorySearch';
import AgentHistoryStats from './AgentHistoryStats';
import { fetchAgent } from '../../features/agents/agentsSlice';
import { testTimocomConnection, fetchOffersForAllDestinations } from '../../api/timocomAdapterService';
import { selectAllLogisticsBases, fetchLogisticsBases } from '../../features/company/logisticsBasesSlice';
import axios from 'axios'; // Import axios
import { germanStateCities } from '../../utils/germanCities';

// Definiujemy bezpośrednio, ignorując zmienną środowiskową na razie
const API_BASE_URL = 'http://localhost:5000';

const AgentHistory = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [tabIndex, setTabIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [isTimocomLoading, setIsTimocomLoading] = useState(false);
  const [isSearchingOffers, setIsSearchingOffers] = useState(false);
  const [timocomResponse, setTimocomResponse] = useState(null);
  const mountedRef = useRef(true);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const history = useSelector(selectAgentHistory);
  const status = useSelector(selectAgentHistoryStatus);
  const error = useSelector(selectAgentHistoryError);
  const agent = useSelector(state => state.agents.currentAgent);
  const logisticsBases = useSelector(selectAllLogisticsBases);

  const historyIsEmpty = !history || history.length === 0;

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading && mountedRef.current) {
        setLoadingTimeout(true);
        setIsLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  useEffect(() => {
    if (!logisticsBases || logisticsBases.length === 0) {
      dispatch(fetchLogisticsBases());
    }
  }, [dispatch, logisticsBases]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setLoadingTimeout(false);

      try {
        if (!agent || agent.id !== id) {
          const existingAgent = agent
          if (!existingAgent || existingAgent.id !== id) {
             console.log("Fetching agent data because it's not in state or ID mismatch");
             await dispatch(fetchAgent(id)).unwrap();
          } else {
             console.log("Agent data already in state, skipping fetch.");
          }
        }

        await dispatch(fetchAgentHistory(id)).unwrap();

      } catch (error) {
        console.error('Błąd podczas ładowania danych:', error);
        if (mountedRef.current) {
          toast({
            title: 'Błąd',
            description: 'Wystąpił problem podczas ładowania danych. Spróbuj ponownie.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [dispatch, id, toast]);

  const handleClearHistory = () => {
    if (window.confirm('Czy na pewno chcesz wyczyścić całą historię działania tego agenta?')) {
      dispatch(clearAgentHistory(id))
        .unwrap()
        .then(() => {
          if (mountedRef.current) {
            toast({
              title: 'Historia wyczyszczona',
              description: 'Historia działania agenta została wyczyszczona',
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
          }
        })
        .catch(error => {
          if (mountedRef.current) {
            toast({
              title: 'Błąd',
              description: `Nie udało się wyczyścić historii: ${error.message}`,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }
        });
    }
  };

  const handleTabsChange = (index) => {
    setTabIndex(index);
  };

  const handleBackToList = () => {
    navigate('/agents');
  };

  const handleTimocomApiCall = async () => {
    setIsTimocomLoading(true);
    setTimocomResponse(null);

    try {
      console.log(`Wywołanie API TIMOCOM dla agenta ID: ${id}`);

      const connectionTest = await testTimocomConnection();
      console.log('Test połączenia z TIMOCOM:', connectionTest);

      if (connectionTest.success) {
        const agentData = agent || (await dispatch(fetchAgent(id)).unwrap());

        if (!agentData) {
          throw new Error('Nie można pobrać danych agenta');
        }

        const selectedBaseId = agentData.selectedLogisticsBase;
        if (!selectedBaseId) {
          throw new Error('Agent nie ma przypisanej bazy logistycznej.');
        }
        const startLocation = logisticsBases.find(base => base.id === selectedBaseId);
        if (!startLocation || !startLocation.address || !startLocation.address.city || !startLocation.address.postalCode || !startLocation.address.country) {
            console.error("Nie znaleziono pełnych danych dla bazy logistycznej ID:", selectedBaseId, " Dostępne bazy:", logisticsBases);
            throw new Error(`Brak pełnych danych adresowych dla wybranej bazy logistycznej (ID: ${selectedBaseId}). Sprawdź ustawienia.`);
        }

        const agentConfig = {
            id: agentData.id,
            name: agentData.name,
            operationalArea: agentData.operationalArea || [],
            vehiclePreferences: agentData.vehiclePreferences || {},
            timocomSettings: agentData.timocomSettings || { destinationCities: [] }
        };

        if (!agentConfig.timocomSettings.destinationCities || agentConfig.timocomSettings.destinationCities.length === 0) {
             console.warn("Brak zdefiniowanych miast docelowych w konfiguracji TIMOCOM agenta.");
        }

        console.log("Używana lokalizacja startowa:", startLocation);
        console.log("Używana konfiguracja agenta do wyszukiwania:", agentConfig);

        const offersResponse = await fetchOffersForAllDestinations(agentConfig, startLocation, []);
        console.log('Odpowiedź TIMOCOM (oferty):', offersResponse);

        setTimocomResponse({
          connectionTest,
          offersResponse
        });
        onOpen();

        toast({
          title: 'Sukces',
          description: `Pomyślnie wywołano API TIMOCOM. Znaleziono ${offersResponse?.data?.length || 0} ofert (źródło: ${offersResponse?.source || '-'}). ${offersResponse?.errors?.length || 0} błędów.`,
          status: offersResponse?.errors?.length > 0 ? 'warning' : 'success',
          duration: 7000,
          isClosable: true,
        });

      } else {
        setTimocomResponse({ connectionTest });
        onOpen();
        toast({
          title: 'Błąd połączenia',
          description: connectionTest.error || 'Nie udało się połączyć z API TIMOCOM przez proxy.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }

    } catch (error) {
      console.error('Błąd podczas wywoływania API TIMOCOM:', error);
      if (mountedRef.current) {
        setTimocomResponse({ error: { message: error.message, stack: error.stack } });
        onOpen();
        toast({
          title: 'Błąd krytyczny',
          description: `Wystąpił błąd: ${error.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsTimocomLoading(false);
      }
    }
  };

  const handleSearchOffers = async () => {
    if (!id) return;
    setIsSearchingOffers(true);
    console.log(`Frontend: Triggering search offers for agent ID: ${id}`);

    try {
      // Pobierz aktualne dane agenta, jeśli nie są dostępne
      const agentData = agent || (await dispatch(fetchAgent(id)).unwrap());
      
      if (!agentData) {
        throw new Error('Nie można pobrać danych agenta');
      }
      
      // Sprawdź, czy agent ma wybrane miasto docelowe
      if (!agentData.destinationCity) {
        throw new Error('Agent nie ma wybranego miasta docelowego. Zaktualizuj ustawienia agenta.');
      }
      
      // Znajdź dane miasta docelowego
      const destinationCity = germanStateCities.find(city => city.name === agentData.destinationCity);
      if (!destinationCity) {
        throw new Error(`Nie znaleziono danych dla miasta ${agentData.destinationCity}. Wybierz inne miasto docelowe.`);
      }
      
      // Użyj promienia poszukiwań z ustawień agenta lub wartości domyślnej
      const searchRadius = agentData.searchRadius || 30;
      
      console.log('DEBUG: API_BASE_URL=', API_BASE_URL);
      console.log('Miasto docelowe:', destinationCity);
      console.log('Promień poszukiwań:', searchRadius, 'km');
      
      // Przygotuj parametry wyszukiwania
      const searchParams = {
        destinationCity: destinationCity,
        searchRadius: searchRadius
      };
      
      // Wywołaj API z nowymi parametrami
      const response = await axios.post(`${API_BASE_URL}/api/agents/${id}/search-offers`, searchParams); 
      
      console.log('Frontend: Search offers response:', response.data);

      if (response.data.success) {
        toast({
          title: 'Wyszukiwanie ofert zakończone',
          description: response.data.message || `Pomyślnie wyszukano i zapisano ${response.data.offersFound} ofert.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        // Odśwież historię, aby pokazać nowe wpisy
        dispatch(fetchAgentHistory(id)); 
      } else {
         // Jeśli backend zwrócił success: false
         throw new Error(response.data.error || 'Backend zwrócił błąd podczas wyszukiwania ofert.');
      }

    } catch (err) {
      console.error('Frontend: Error searching offers:', err);
      let errorMessage = 'Wystąpił błąd podczas wyszukiwania ofert.';
      let errorDetails = null;
      
      // Spróbuj uzyskać bardziej szczegółowy błąd z odpowiedzi axios
      if (err.response && err.response.data) {
        if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
        
        // Pobierz szczegóły błędu, jeśli są dostępne
        if (err.response.data.errorDetails) {
          errorDetails = err.response.data.errorDetails;
          console.log('Szczegóły błędu:', errorDetails);
          
          // Jeśli mamy szczegóły błędów walidacji, dodaj je do komunikatu
          if (errorDetails.invalidParams && Array.isArray(errorDetails.invalidParams)) {
            const invalidParamsInfo = errorDetails.invalidParams
              .map(param => `${param.name}: ${param.userFriendlyMessage || param.reason}`)
              .join('; ');
            
            errorMessage += ` Nieprawidłowe parametry: ${invalidParamsInfo}`;
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Otwórz modal z szczegółami błędu
      setTimocomResponse({ 
        error: { 
          message: errorMessage,
          details: errorDetails 
        }
      });
      onOpen();
      
      toast({
        title: 'Błąd wyszukiwania ofert',
        description: errorMessage,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsSearchingOffers(false);
    }
  };

  const displayHistory = history;

  const timocomResponseModal = (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Odpowiedź API TIMOCOM</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {timocomResponse?.connectionTest && (
            <Box mb={4}>
              <Text fontWeight="bold">Wynik testu połączenia:</Text>
              <Code display="block" whiteSpace="pre" p={2} overflowX="auto">
                {JSON.stringify(timocomResponse.connectionTest, null, 2)}
              </Code>
            </Box>
          )}
          {timocomResponse?.offersResponse && (
            <Box mb={4}>
              <Text fontWeight="bold">Wynik wyszukiwania ofert:</Text>
              <Text fontSize="sm">Źródło: {timocomResponse.offersResponse.source}</Text>
              {timocomResponse.offersResponse.errors && (
                <Alert status="warning" mb={2}>
                  <AlertIcon />
                  <VStack align="start" spacing={0}>
                    <AlertTitle>Wystąpiły błędy podczas pobierania części ofert.</AlertTitle>
                    <AlertDescription fontSize="xs">{timocomResponse.offersResponse.combinedError}</AlertDescription>
                  </VStack>
                </Alert>
              )}
              <Code display="block" whiteSpace="pre" p={2} overflowX="auto">
                {`Znaleziono ofert: ${timocomResponse.offersResponse.data?.length || 0}`}
                {timocomResponse.offersResponse.data?.length > 0 && "\nPierwsza oferta (ID): " + timocomResponse.offersResponse.data[0]?.id}
              </Code>
            </Box>
          )}
          {timocomResponse?.error && (
            <Box mb={4}>
              <Text fontWeight="bold">Błąd wykonania:</Text>
              <Alert status="error" mb={2}>
                <AlertIcon />
                <AlertTitle>Wystąpił błąd podczas przetwarzania.</AlertTitle>
              </Alert>
              <Code display="block" whiteSpace="pre" p={2} overflowX="auto">
                {timocomResponse.error.message}
              </Code>
              
              {timocomResponse.error.details && (
                <Box mt={3}>
                  <Text fontWeight="bold">Szczegóły błędu:</Text>
                  {timocomResponse.error.details.type && (
                    <Text fontSize="sm">Typ błędu: {timocomResponse.error.details.type}</Text>
                  )}
                  
                  {timocomResponse.error.details.invalidParams && (
                    <Box mt={2}>
                      <Text fontSize="sm" fontWeight="semibold">Nieprawidłowe parametry:</Text>
                      <VStack align="start" spacing={1} mt={1}>
                        {timocomResponse.error.details.invalidParams.map((param, idx) => (
                          <Box key={idx} p={2} bg="red.50" borderRadius="md" width="100%">
                            <Text fontSize="sm" fontWeight="bold">{param.name}</Text>
                            <Text fontSize="sm">{param.userFriendlyMessage || param.reason}</Text>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}
                  
                  {timocomResponse.error.details.message && (
                    <Text fontSize="sm" mt={2}>{timocomResponse.error.details.message}</Text>
                  )}
                </Box>
              )}
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Zamknij
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  if (status === 'loading' || (status === 'idle' && isLoading)) {
    return (
      <Box p={5}>
        <Flex justify="space-between" align="center" mb={4}>
          <HStack spacing={2}>
            <IconButton
              aria-label="Powrót do listy"
              icon={<ArrowBackIcon />}
              onClick={handleBackToList}
            />
            <Heading size="lg">Historia działania agenta</Heading>
          </HStack>
        </Flex>
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
          <Text mt={4}>Ładowanie historii...</Text>
        </Flex>
        {timocomResponseModal}
      </Box>
    );
  }

  if (loadingTimeout && history.length === 0) {
    return (
      <Box p={5}>
        <Flex justify="space-between" align="center" mb={4}>
          <HStack spacing={2}>
            <IconButton
              aria-label="Powrót do listy"
              icon={<ArrowBackIcon />}
              onClick={handleBackToList}
            />
            <Heading size="lg">Historia działania agenta</Heading>
          </HStack>
        </Flex>
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle mr={2}>Przekroczono czas oczekiwania</AlertTitle>
          <AlertDescription>
            Ładowanie historii trwa zbyt długo. Możesz spróbować odświeżyć stronę lub wrócić później.
          </AlertDescription>
        </Alert>
        <Button mt={4} colorScheme="blue" onClick={handleBackToList}>
          Powrót do listy agentów
        </Button>
        {timocomResponseModal}
      </Box>
    );
  }

  if ((status === 'failed' && error) && history.length === 0) {
    return (
      <Box p={5}>
        <Flex justify="space-between" align="center" mb={4}>
          <HStack spacing={2}>
            <IconButton
              aria-label="Powrót do listy"
              icon={<ArrowBackIcon />}
              onClick={handleBackToList}
            />
            <Heading size="lg">Historia działania agenta</Heading>
          </HStack>
        </Flex>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Błąd!</AlertTitle>
          <AlertDescription>{typeof error === 'string' ? error : JSON.stringify(error)}</AlertDescription>
        </Alert>
        <Button mt={4} colorScheme="blue" onClick={handleBackToList}>
          Powrót do listy agentów
        </Button>
        {timocomResponseModal}
      </Box>
    );
  }

  if (status === 'succeeded' && historyIsEmpty) {
    return (
      <Box p={5}>
        <Flex justify="space-between" align="center" mb={4}>
          <HStack spacing={2}>
            <IconButton
              aria-label="Powrót do listy"
              icon={<ArrowBackIcon />}
              onClick={handleBackToList}
            />
            <Heading size="lg">Historia działania agenta {agent ? `- ${agent.name}` : ''}</Heading>
          </HStack>
          <HStack spacing={2}>
            <Button
              colorScheme="teal"
              leftIcon={<SearchIcon />}
              onClick={handleSearchOffers}
              isLoading={isSearchingOffers}
              loadingText="Szukam..."
            >
              Szukaj Ofert
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<QuestionOutlineIcon />}
              onClick={handleTimocomApiCall}
              isLoading={isTimocomLoading}
              loadingText="Testuję..."
            >
              Testuj API TIMOCOM
            </Button>
          </HStack>
        </Flex>
        <Alert status="warning" mt={4}>
          <AlertIcon />
          <AlertTitle mr={2}>Brak historii</AlertTitle>
          <AlertDescription>Nie znaleziono żadnych wpisów w historii dla tego agenta.</AlertDescription>
        </Alert>
        {timocomResponseModal}
      </Box>
    );
  }

  if (status === 'succeeded' && !historyIsEmpty) {
    return (
      <Box p={5}>
        <Flex justify="space-between" align="center" mb={4}>
          <HStack spacing={2}>
            <IconButton
              aria-label="Powrót do listy"
              icon={<ArrowBackIcon />}
              onClick={handleBackToList}
            />
            <Heading size="lg">Historia działania agenta {agent ? `- ${agent.name}` : ''}</Heading>
          </HStack>
          <HStack spacing={2}>
            <Button
              colorScheme="teal"
              leftIcon={<SearchIcon />}
              onClick={handleSearchOffers}
              isLoading={isSearchingOffers}
              loadingText="Szukam..."
            >
              Szukaj Ofert
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<QuestionOutlineIcon />}
              onClick={handleTimocomApiCall}
              isLoading={isTimocomLoading}
              loadingText="Testuję..."
            >
              Testuj API TIMOCOM
            </Button>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={handleClearHistory}
              isDisabled={historyIsEmpty || status === 'loading'}
            >
              Wyczyść historię
            </Button>
          </HStack>
        </Flex>
        <Divider mb={4} />

        <AgentHistoryStats history={displayHistory} />

        <Tabs index={tabIndex} onChange={handleTabsChange} variant="soft-rounded" colorScheme="purple" mt={6}>
          <TabList mb="1em">
            <Tab>Wszystkie</Tab>
            <Tab>Wyszukiwanie</Tab>
            <Tab>Zlecenia</Tab>
            <Tab>System</Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={0}>
              <AgentHistorySearch history={displayHistory} filter="all" />
            </TabPanel>
            <TabPanel p={0}>
              <AgentHistorySearch history={displayHistory} filter="search" />
            </TabPanel>
            <TabPanel p={0}>
              <AgentHistorySearch history={displayHistory} filter="order" />
            </TabPanel>
            <TabPanel p={0}>
              <AgentHistorySearch history={displayHistory} filter="system" />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {timocomResponseModal}
      </Box>
    );
  }

  return (
    <Box p={5}>
      <Text>Nieoczekiwany stan komponentu.</Text>
      <Button mt={4} onClick={handleBackToList}>Powrót do listy</Button>
    </Box>
  );
};

export default AgentHistory;
