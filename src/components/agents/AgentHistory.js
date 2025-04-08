import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Flex,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  Text,
  Button,
  IconButton,
  Divider,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
  HStack
} from '@chakra-ui/react';
import { ArrowBackIcon, QuestionOutlineIcon } from '@chakra-ui/icons';
import { fetchAgent } from '../../features/agents/agentsSlice';
import { fetchLogisticsBases, selectAllLogisticsBases } from '../../features/company/logisticsBasesSlice';
import AgentHistorySearch from './AgentHistorySearch';
import axios from 'axios';
const API_BASE_URL = 'http://localhost:5000';

const AgentHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const agent = useSelector(state => state.agents.currentAgent);
  const logisticsBases = useSelector(selectAllLogisticsBases);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [searchResults, setSearchResults] = useState([]); 
  const toast = useToast();
  const mountedRef = useRef(true);

  useEffect(() => {
    console.log('[AgentHistory Init] Component mounting...');
    console.log('[AgentHistory Init] useParams id:', id);
    console.log('[AgentHistory Init] useSelector agent:', agent ? 'Object' : agent);
    console.log('[AgentHistory Init] useSelector logisticsBases:', logisticsBases);

    mountedRef.current = true;
    return () => {
      console.log('[AgentHistory Cleanup] Component unmounting...');
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchAgentData = async () => {
      if (id && (!agent || agent.id !== parseInt(id))) {
        console.log(`Fetching agent data for id: ${id} because it's not in state or ID mismatch`);
        setIsLoading(true);
        try {
          await dispatch(fetchAgent(id)).unwrap();
          if (mountedRef.current) {
            console.log(`Agent data fetched successfully for id: ${id}`);
          }
        } catch (error) {
          if (mountedRef.current) {
            console.error(`Error fetching agent data for id: ${id}`, error);
            toast({ title: 'Błąd', description: 'Nie udało się pobrać danych agenta.', status: 'error' });
          }
        } finally {
          if (mountedRef.current) {
            console.log(`[AgentHistory fetch finally] Setting isLoading to false for id: ${id}`);
            setIsLoading(false);
          }
        }
      } else if (id && agent && agent.id === parseInt(id)) {
        console.log(`Agent id: ${id} already in state. Setting isLoading to false.`);
        if (isLoading) setIsLoading(false);
      }
    };

    fetchAgentData();
  }, [dispatch, id, agent, isLoading, toast]);

  useEffect(() => {
    if (!logisticsBases || logisticsBases.length === 0) {
      dispatch(fetchLogisticsBases());
    }
  }, [dispatch, logisticsBases]);

  useEffect(() => {
    const fetchLatestOffers = async () => {
      if (!id) return; 

      setIsLoading(true);
      setSearchResults([]); 

      try {
        console.log(`[AgentHistory] Fetching latest offers for agent ${id}...`);
        const response = await axios.get(`${API_BASE_URL}/api/agents/${id}/latest-offers`);
        console.log('[AgentHistory] Latest offers response:', response.data);

        if (response.data && Array.isArray(response.data.offers)) {
          setSearchResults(response.data.offers);
        } else {
          setSearchResults([]);
          console.warn('[AgentHistory] No offers found in latest offers response or invalid data structure.');
        }
      } catch (err) {
        console.error('Error fetching latest offers:', err);
        setSearchResults([]); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestOffers();
  }, [id]);

  const handleBackToList = () => {
    navigate('/agents');
  };

  const handleSearchOffers = async () => {
    console.log(`[AgentHistory] handleSearchOffers called for agent ${id}`);

    if (!agent) {
        toast({ title: 'Błąd', description: 'Dane agenta nie są załadowane.', status: 'warning' });
        return;
    }
    // Sprawdź, czy bazy logistyczne są załadowane
    if (!logisticsBases || logisticsBases.length === 0) {
        toast({ title: 'Błąd', description: 'Dane baz logistycznych nie są załadowane.', status: 'warning' });
        return;
    }
     // Sprawdź, czy agent ma przypisaną bazę - używamy pola selectedLogisticsBase
    if (!agent.selectedLogisticsBase) {
        console.error('[AgentHistory] Condition "!agent.selectedLogisticsBase" is true. selectedLogisticsBase is:', agent.selectedLogisticsBase);
        toast({ title: 'Błąd', description: 'Agent nie ma przypisanej bazy logistycznej (pole selectedLogisticsBase).', status: 'warning' });
        return;
    }

    // Znajdź bazę logistyczną agenta - używamy pola selectedLogisticsBase
    const agentBase = logisticsBases.find(base => base.id === agent.selectedLogisticsBase);

    if (!agentBase) {
        // Poprawiony komunikat błędu
        toast({ title: 'Błąd', description: `Nie znaleziono bazy logistycznej o ID: ${agent.selectedLogisticsBase} przypisanej do agenta.`, status: 'error' });
        return;
    }

     // Sprawdź, czy baza ma dane lokalizacyjne
     // Załóżmy, że struktura to agentBase.address.city, agentBase.address.country, agentBase.address.postalCode
     if (!agentBase.address || !agentBase.address.city || !agentBase.address.country || !agentBase.address.postalCode) {
        toast({ title: 'Błąd', description: `Brak pełnych danych adresowych dla bazy: ${agentBase.name}.`, status: 'warning' });
        return;
     }

    setIsSearching(true);
    setSearchResults([]); 
    try {
      // Przygotuj parametry wyszukiwania
      const defaultDestination = { name: 'Berlin', country: 'DE', postalCode: '10115' };
      let destinationToSend = defaultDestination; // Domyślnie Berlin

      // Sprawdź, czy agent.destinationCity jest obiektem i ma wymagane pola
      if (typeof agent.destinationCity === 'object' && agent.destinationCity !== null &&
          agent.destinationCity.name && agent.destinationCity.country && agent.destinationCity.postalCode) {
          destinationToSend = agent.destinationCity; // Użyj obiektu z agenta
      } else if (typeof agent.destinationCity === 'string' && agent.destinationCity.length > 0) {
           console.warn(`[AgentHistory] agent.destinationCity is a string ("${agent.destinationCity}"). Using default destination.`);
           // Na razie używamy domyślnego dla pewności działania.
      }
       // Jeśli agent.destinationCity jest null, undefined, pustym stringiem lub obiektem bez wymaganych pól, użyty zostanie defaultDestination.

      const searchParams = {
        originCity: { // Punkt startowy - baza agenta
            name: agentBase.address.city,
            country: agentBase.address.country,
            postalCode: agentBase.address.postalCode,
        },
        destinationCity: destinationToSend, // Zawsze wysyłamy obiekt
        searchRadius: agent.searchRadius || 50, // Użyj zapisanego lub domyślnego
        // TODO: Dodaj inne parametry z konfiguracji agenta, jeśli są potrzebne
      };

      console.log(`[AgentHistory] Calling POST ${API_BASE_URL}/api/agents/${id}/search-offers with params:`, searchParams);

      const response = await axios.post(`${API_BASE_URL}/api/agents/${id}/search-offers`, searchParams);

      console.log('[AgentHistory] Search response:', response.data);

      if (response.data.success) {
        const receivedOffers = response.data.offers || [];
        console.log(`[AgentHistory] Received ${receivedOffers.length} offers initially.`);

        setSearchResults(receivedOffers); 

        toast({
          title: 'Wyszukiwanie zakończone.',
          description: `Wyświetlanie ${receivedOffers.length} ofert.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(response.data.error || 'Nie udało się wyszukać ofert.');
      }
    } catch (error) {
      console.error('[AgentHistory] Error searching offers:', error);
      toast({
        title: 'Błąd wyszukiwania.',
        description: error.response?.data?.error || error.message || 'Wystąpił błąd podczas wyszukiwania ofert.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearHistory = async () => {
    console.log(`[AgentHistory] handleClearHistory called for agent ${id}`);
    setIsClearing(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/agents/${id}/history`);
      console.log('[AgentHistory] Clear history response:', response.data);
      if (response.data.success) {
        toast({
          title: 'Historia wyczyszczona.',
          description: response.data.message || 'Historia wyszukiwań została usunięta. Lista zostanie odświeżona.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(response.data.error || 'Nie udało się wyczyścić historii.');
      }
    } catch (error) {
      console.error('[AgentHistory] Error clearing history:', error);
      toast({
        title: 'Błąd czyszczenia historii.',
        description: error.message || 'Wystąpił błąd podczas usuwania historii.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsClearing(false);
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!agent) {
    return (
      <Alert status="error" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px">
        <AlertIcon boxSize="40px" mr={0} />
        <Heading size="lg" mt={4} mb={1}>Nie znaleziono agenta</Heading>
        <Text maxWidth="sm">Nie można znaleźć agenta o podanym ID.</Text>
        <Button mt={4} onClick={handleBackToList}>Wróć do listy</Button>
      </Alert>
    );
  }

  return (
    <Box p={5}>
      <Flex mb={4} justify="space-between" align="center">
        <IconButton
          icon={<ArrowBackIcon />}
          aria-label="Wróć do listy"
          onClick={handleBackToList}
        />
        <Heading size="lg">Agent: {agent.name}</Heading>
        <IconButton
          icon={<QuestionOutlineIcon />}
          aria-label="Pomoc"
          onClick={onOpen}
        />
      </Flex>

      <HStack spacing={4} mb={4}>
        <Button
          colorScheme="blue"
          onClick={handleSearchOffers}
          isLoading={isSearching}
          loadingText="Szukam..."
          disabled={isSearching || isClearing}
        >
          Szukaj Ofert
        </Button>
        <Button
          colorScheme="red"
          variant="outline"
          onClick={handleClearHistory}
          isLoading={isClearing}
          loadingText="Czyszczę..."
          disabled={isSearching || isClearing}
        >
          Wyczyść Historię
        </Button>
      </HStack>

      <Divider mb={4} />

      <VStack spacing={4} align="stretch" mt={5}>
        <AgentHistorySearch agentId={id} offers={searchResults} /> 
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pomoc</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Tutaj może być treść pomocy.</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Zamknij
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AgentHistory;
