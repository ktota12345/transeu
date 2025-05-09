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
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@chakra-ui/react';
import { ArrowBackIcon, QuestionOutlineIcon } from '@chakra-ui/icons';
import { fetchAgent } from '../../features/agents/agentsSlice';
import { fetchLogisticsBases, selectAllLogisticsBases } from '../../features/company/logisticsBasesSlice';
import AgentHistorySearch from './AgentHistorySearch';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

  // Nowe stany dla sekwencji
  const [isFindingSequence, setIsFindingSequence] = useState(false);
  const [sequenceResult, setSequenceResult] = useState(null);
  const [sequenceResults, setSequenceResults] = useState([]); // Lista wyników sekwencji
  const [sequenceError, setSequenceError] = useState(null);

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
    fetchLatestOffers();
  }, [id]);

  useEffect(() => {
    // Resetuj stan sekwencji przy zmianie agenta
    setSequenceResult(null);
    setSequenceResults([]); // Wyczysc liste wynikow
    setSequenceError(null);
  }, [id]);

  const handleBackToList = () => {
    navigate('/agents');
  };

  const handleSearchOffers = async () => {
    console.log(`[AgentHistory] handleSearchOffers called for agent ${id}`);

    // Resetuj stan sekwencji przed nowym wyszukiwaniem ofert
    setSequenceResult(null);
    setSequenceResults([]); // Wyczysc liste wynikow
    setSequenceError(null);
    setIsFindingSequence(false);

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
      console.error('[AgentHistory] Error searching offers:', error.response ? JSON.stringify(error.response.data) : error.message);
      toast({
        title: 'Błąd wyszukiwania.',
        description: error.response?.data?.message || error.response?.data?.error || error.message || 'Wystąpił błąd podczas wyszukiwania ofert.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleFindSequence = async () => {
    console.log("[AgentHistory] handleFindSequence called.");
    setSequenceResult(null);
    setSequenceResults([]); // Wyczysc liste wynikow
    setSequenceError(null);

    if (!searchResults || searchResults.length === 0) {
      toast({ title: 'Błąd', description: 'Najpierw wyszukaj oferty początkowe.', status: 'warning' });
      return;
    }

    if (!agent || !logisticsBases || logisticsBases.length === 0) {
      toast({ title: 'Błąd', description: 'Brak danych agenta lub baz logistycznych.', status: 'error' });
      return;
    }

    // Znajdź bazę domową agenta (jak w handleSearchOffers)
    const agentBase = logisticsBases.find(base => base.id === agent.selectedLogisticsBase);
    if (!agentBase || !agentBase.address?.city || !agentBase.address?.country) {
         toast({ title: 'Błąd', description: 'Nie można zidentyfikować lub brak danych adresowych bazy domowej agenta.', status: 'error' });
         return;
    }

    // Wybierz pierwszą ofertę z wyników jako ofertę początkową
    const initialOffer = searchResults[0];
    console.log("[AgentHistory] Using initial offer:", initialOffer);
    console.log("[AgentHistory] Using home base:", agentBase);

    // Spróbujmy znaleźć adres dostawy i datę rozładunku
    const deliveryAddressData = initialOffer.deliveryAddress || initialOffer.loadingPlaces?.[1]?.address || initialOffer.destinationPlace?.address;
    const latestDateData = initialOffer.loadingDate?.latest || initialOffer.deliveryDate?.latest || initialOffer.loadingPlaces?.[1]?.latestLoadingDate; // Lub inna odpowiednia data

    // Sprawdź czy oferta początkowa ma potrzebne dane (po próbie znalezienia ich)
    if (!deliveryAddressData?.city || !deliveryAddressData?.country || !latestDateData) {
         toast({ 
             title: 'Błąd Walidacji Oferty Początkowej', 
             description: 'Nie można znaleźć kompletnych danych adresowych dostawy (miasto, kraj) lub daty rozładunku w strukturze oferty.', 
             status: 'warning',
             duration: 7000,
             isClosable: true,
         });
         console.error("Validation Failed - Initial Offer Structure:", JSON.stringify(initialOffer, null, 2));
         return;
    }

    setIsFindingSequence(true);
    try {
      console.log("[AgentHistory] Calling POST /api/sequences/find");
      const payload = { 
          initialOffer: { // Przekazujemy tylko potrzebne, znormalizowane dane
              // Używamy danych znalezionych powyżej
              deliveryAddress: { 
                  city: deliveryAddressData.city,
                  country: deliveryAddressData.country,
                  postalCode: deliveryAddressData.postalCode // Może być undefined, backend to obsłuży
              },
              loadingDate: { // Potrzebujemy `latest` dla logiki backendu
                  latest: latestDateData 
              },
              // Możesz dodać inne pola z initialOffer, jeśli backend ich potrzebuje, np. ID
              id: initialOffer.id 
          }, 
          homeBase: agentBase // Przekazujemy cały obiekt bazy
      };
      console.log("[AgentHistory] Payload for /api/sequences/find:", JSON.stringify(payload, null, 2));

      const response = await axios.post(`${API_BASE_URL}/api/sequences/find`, payload); // Wysyłamy zmodyfikowany payload
      console.log("[AgentHistory] Sequence find response:", response.data);

      // Poprawiono logikę obsługi odpowiedzi z tablicą 'offers'
      if (response.data && response.data.success && response.data.offers && response.data.offers.length > 0) {
        setSequenceResults(response.data.offers); // Ustawiamy stan dla listy wyników sekwencji
        setSequenceResult(null); // Wyczysc stan dla pojedynczej sekwencji, jesli byl uzywany
        setSequenceError(''); // Wyczyść ewentualny poprzedni błąd
      } else if (response.data && response.data.success && response.data.sequence) {
        // Obsluga przypadku, gdyby API jednak zwrocilo pojedyncza sekwencje (mniej prawdopodobne teraz)
        setSequenceResult(response.data.sequence); // Zapisz { initial, return }
        setSequenceResults([]); // Wyczysc liste
        setSequenceError('');
      } else {
        // Obsługa braku wyników lub innego błędu
        setSequenceResult(null);
        setSequenceResults([]); // Upewnij się, że lista też jest czyszczona
        setSequenceError(response.data?.message || 'Nie znaleziono ofert powrotnych spełniających kryteria.');
      }
    } catch (error) {
      console.error('Error finding sequence:', error);
      setSequenceResult(null);
      const errorMsg = error.response?.data?.message || error.message || 'Wystąpił błąd podczas szukania oferty powrotnej.';
       const errorDetails = error.response?.data?.details;
      setSequenceError(errorMsg + (errorDetails ? ` (Szczegóły: ${JSON.stringify(errorDetails)})` : ''));
      toast({ 
        title: 'Błąd szukania sekwencji', 
        description: errorMsg + (errorDetails ? ` (Szczegóły: ${JSON.stringify(errorDetails)})` : ''), 
        status: 'error',
        duration: 7000,
        isClosable: true, 
      });
    } finally {
      setIsFindingSequence(false);
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

  const calculateProfitability = (offer) => {
    if (!offer || !offer.price?.amount || !offer.distance_km || offer.distance_km <= 0) {
      return 0; // Zwraca 0 dla niekompletnych lub niepoprawnych danych
    }
    return offer.price.amount / offer.distance_km;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return null;
    }
  };

  const renderOfferDetails = (offer) => {
    // Oblicz stawkę za km
    const ratePerKm = calculateProfitability(offer);

    // Wyciągnij miasta załadunku i rozładunku (obsługa różnych struktur)
    const originCity = offer.loadingAddress?.city || offer.loadingPlaces?.[0]?.address?.city || 'Nieznane';
    const destinationCity = offer.deliveryAddress?.city || offer.loadingPlaces?.[1]?.address?.city || offer.destinationPlace?.address?.city || 'Nieznane';
    const route = `${originCity} - ${destinationCity}`;

    // Wyciągnij daty z loadingPlaces
    const loadingInfo = offer.loadingPlaces?.find(place => place.loadingType === 'LOADING');
    const unloadingInfo = offer.loadingPlaces?.find(place => place.loadingType === 'UNLOADING');

    const loadingDateRange = loadingInfo 
      ? `${formatDate(loadingInfo.earliestLoadingDate) || '?'}${loadingInfo.latestLoadingDate !== loadingInfo.earliestLoadingDate ? ' - ' + (formatDate(loadingInfo.latestLoadingDate) || '?') : ''} ${loadingInfo.startTime || loadingInfo.endTime ? `(${(loadingInfo.startTime || '?')}-${(loadingInfo.endTime || '?')})` : ''}` 
      : 'Brak danych';
    const unloadingDateRange = unloadingInfo 
      ? `${formatDate(unloadingInfo.earliestLoadingDate) || '?'}${unloadingInfo.latestLoadingDate !== unloadingInfo.earliestLoadingDate ? ' - ' + (formatDate(unloadingInfo.latestLoadingDate) || '?') : ''} ${unloadingInfo.startTime || unloadingInfo.endTime ? `(${(unloadingInfo.startTime || '?')}-${(unloadingInfo.endTime || '?')})` : ''}`
      : 'Brak danych';

    // Prosta funkcja do wyświetlania kluczowych danych oferty
    return (
      // Używamy Box z position relative, aby umożliwić absolutne pozycjonowanie stawki
      <Box borderWidth="1px" borderRadius="lg" p={4} mb={2} shadow="sm" position="relative">
         {/* Stawka w prawym górnym rogu */}
         <Text 
            position="absolute" 
            top="1rem" 
            right="1rem" 
            fontWeight="bold" 
            color="blue.600"
            fontSize="lg" // Można dostosować rozmiar
         >
           {ratePerKm > 0 ? `${ratePerKm.toFixed(2)} ${offer.price?.currency || 'PLN'}/km` : ''} { /* Nie pokazuj 'N/A' */}
         </Text>
         
         {/* Usunięto ID oferty */}
         {/* <Text fontWeight="bold">ID: {offer.id || 'Brak ID'}</Text> */}

         {/* Dodano wyświetlanie trasy */}
         <Text fontWeight="bold" fontSize="xl" mb={2}>{route}</Text> 
         
         {/* Pozostałe informacje - odsunięte od prawego brzegu, jeśli stawka jest widoczna */}
         <Box pr={ratePerKm > 0 ? "120px" : "0"}> { /* Dodaj padding po prawej, jeśli stawka istnieje */}
            {/* Usunięto opis */}
            {/* <Text>Opis: {offer.description || 'Brak opisu'}</Text> */}
            <Text fontSize="sm">Cena: {offer.price?.amount || 'Brak ceny'} {offer.price?.currency || 'PLN'}</Text>
            <Text fontSize="sm">Odległość: {offer.distance_km || 'Brak danych'} km</Text>
            {/* Usunięto stawkę z tego miejsca */}
            {/* <Text fontWeight="bold">Stawka: {ratePerKm > 0 ? `${ratePerKm.toFixed(2)} ${offer.price?.currency || 'PLN'}/km` : 'N/A'}</Text> */}
            
            {/* Wyświetlanie pełnych zakresów dat - NOWA LOGIKA + Zmniejszono fontSize */}
            <Text fontSize="sm">Załadunek: {loadingDateRange}</Text>
            <Text fontSize="sm">Rozładunek: {unloadingDateRange}</Text>
            
            {/* Usunięto stare wyświetlanie dat */}
            {/* <Text>Data załadunku: {formatDate(offer.loadingDate?.earliest) || 'Brak danych'}</Text> */}
            {/* <Text>Data rozładunku: {formatDate(offer.deliveryDate?.latest) || 'Brak danych'}</Text> */}
         </Box>
      </Box>
    );
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

      <Tabs variant="soft-rounded" colorScheme="blue">
        <TabList mb="1em">
          <Tab>Historia ofert</Tab>
          <Tab>Sekwencje</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0}>
            <VStack spacing={4} align="stretch">
              {/* Usunięto zduplikowany przycisk 'Szukaj Ofert' */}
              {/* 
              <Button 
                colorScheme="blue" 
                onClick={handleSearchOffers} 
                isLoading={isSearching}
                loadingText="Wyszukiwanie..."
                alignSelf="flex-start" 
              >
                Szukaj Ofert
              </Button>
               */}

              {isSearching && (
                <Flex justify="center" align="center" minH="200px">
                  <Spinner isIndeterminate color="blue.300" />
                  <Text ml={3}>Wyszukiwanie...</Text>
                </Flex>
              )}
              {!isSearching && searchResults.length === 0 && (
                <Text>Brak wyników do wyświetlenia. Użyj przycisku "Wyszukaj Oferty".</Text>
              )}
              {!isSearching && searchResults.length > 0 && (
                <VStack spacing={4} align="stretch">
                  {searchResults
                    .filter(offer => offer.price?.amount) // Filtruj oferty bez ceny
                    .sort((a, b) => calculateProfitability(b) - calculateProfitability(a)) // Sortuj wg stawki malejąco
                    .map((offer, index) => {
                       return (
                          <Box key={offer.id || index} borderWidth="1px" borderRadius="lg" p={4}>
                             {renderOfferDetails(offer)}
                          </Box>
                       );
                    })}
                  {/* --- Przycisk do szukania sekwencji --- */}
                  <Button 
                      colorScheme="teal" 
                      onClick={handleFindSequence} 
                      isLoading={isFindingSequence}
                      isDisabled={isSearching || isFindingSequence} // Nieaktywny podczas innych operacji
                      mt={4}
                  >
                    Znajdź Ofertę Powrotną (dla pierwszej oferty)
                  </Button>
                </VStack>
              )}
              {/* --- Sekcja wyświetlania wyniku sekwencji --- */}
              {isFindingSequence && <Spinner mt={4} />}
              {sequenceError && !isFindingSequence && (
                <Alert status="error" mt={4}>
                  <AlertIcon />
                  Błąd sekwencji: {sequenceError}
                </Alert>
              )}
              {/* Sekcja wyświetlania posortowanych wyników sekwencji */}
              {sequenceResults.length > 0 && !isFindingSequence && (
                <VStack spacing={4} align="stretch" mt={6}>
                  <Heading size="sm">Znalezione Oferty Powrotne:</Heading>
                  {sequenceResults
                    .filter(offer => offer.price?.amount) // Dodatkowe filtrowanie na wszelki wypadek
                    .sort((a, b) => calculateProfitability(b) - calculateProfitability(a)) // Sortuj wg stawki malejąco
                    .slice(0, 5) // Pokaż tylko top 5
                    .map((offer, index) => (
                       <Box key={offer.id || index} borderWidth="1px" borderRadius="lg" p={4}>
                          {renderOfferDetails(offer)}
                       </Box>
                   ))}
                </VStack>
               )}
              {/* --- Koniec sekcji sekwencji --- */}
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Button
                colorScheme="teal"
                onClick={handleFindSequence}
                isLoading={isFindingSequence}
                loadingText="Szukanie sekwencji..."
                isDisabled={isSearching || isFindingSequence || searchResults.length === 0} // Poprawiony warunek: usuwamy isLoadingHistory, dodajemy isFindingSequence
                alignSelf="flex-start"
              >
                Znajdź Optymalną Sekwencję
              </Button>

              {isFindingSequence && (
                <Flex justify="center" align="center" minH="100px">
                  <Spinner size="xl" color="teal.500" />
                  <Text ml={4}>Analizowanie ofert i szukanie trasy powrotnej...</Text>
                </Flex>
              )}

              {sequenceError && !isFindingSequence && (
                <Alert status="warning">
                  <AlertIcon />
                  {sequenceError}
                </Alert>
              )}

              {/* Zaktualizowana sekcja wyników sekwencji w drugiej zakładce */}
              {sequenceResults.length > 0 && !isFindingSequence && (
                 <VStack spacing={4} align="stretch" mt={4}>
                     <Heading size="sm">Znalezione Oferty Powrotne:</Heading>
                     {sequenceResults
                       .filter(offer => offer.price?.amount)
                       .sort((a, b) => calculateProfitability(b) - calculateProfitability(a))
                       .slice(0, 5) // Pokaż tylko top 5
                       .map((offer, index) => (
                          <Box key={offer.id || index} borderWidth="1px" borderRadius="lg" p={4}>
                             {renderOfferDetails(offer)}
                          </Box>
                      ))}
                  </VStack>
               )}
              {!isFindingSequence && !sequenceResults.length > 0 && !sequenceError && (
                  <Text color="gray.500">Kliknij przycisk, aby znaleźć najbardziej opłacalną sekwencję tras (oferta + powrót do bazy) na podstawie aktualnych wyników wyszukiwania.</Text>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

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
