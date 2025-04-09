import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Select, 
  FormControl,
  Button,
  Spinner,
  VStack,
  HStack,
  Checkbox,
  useToast
} from '@chakra-ui/react';
import TruckCalendar from './TruckCalendar';
import { vehicles } from '../../data/vehicles';
import startOfWeek from 'date-fns/startOfWeek'; // Potrzebne dla createDate
import pl from 'date-fns/locale/pl'; // Potrzebne dla startOfWeek
import { format } from 'date-fns'; // Do formatowania dat w UI

// --- Przeniesione funkcje pomocnicze ---
const createDate = (dayOffset, hour, minute) => {
  const today = new Date();
  // Używamy startOfWeek, aby upewnić się, że dayOffset odnosi się do bieżącego tygodnia
  const startOfCurrentWeek = startOfWeek(today, { locale: pl, weekStartsOn: 1 });
  const date = new Date(startOfCurrentWeek);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const generateAllTruckSchedules = () => {
  // Używamy przeniesionej funkcji createDate
  return [
    // Wydarzenia dla TRK-001
    {
      id: 1,
      title: 'TRK-001: Transport Nestle Polska S.A.',
      start: createDate(0, 8, 0), // Poniedziałek 8:00
      end: createDate(0, 16, 0),  // Poniedziałek 16:00
      resource: 'TRK-001',
      orderDetails: { /* ... dane zlecenia ... */ }
    },
    {
      id: 7,
      title: 'TRK-001: Transport Nestle cz.2',
      start: createDate(1, 8, 0), // Wtorek 8:00
      end: createDate(1, 14, 0),  // Wtorek 14:00
      resource: 'TRK-001',
      orderDetails: { /* ... dane zlecenia ... */ loadLocation: 'Warszawa, ul. Przemysłowa 12', unloadLocation: 'Kraków, ul. Transportowa 8'}
    },
    // PRZERWA W ŚRODĘ
    {
      id: 2,
      title: 'TRK-001: Transport Volkswagen Poznań Sp. z o.o.',
      start: createDate(3, 7, 0),  // Czwartek 7:00
      end: createDate(3, 15, 0),   // Czwartek 15:00
      resource: 'TRK-001',
      orderDetails: { /* ... dane zlecenia ... */ loadLocation: 'Poznań, ul. Przemysłowa 3', unloadLocation: 'Wrocław, ul. Fabryczna 11'}
    },
    // ... pozostałe wydarzenia ...
     {
      id: 8,
      title: 'TRK-001: Transport Volkswagen cz.2',
      start: createDate(4, 7, 0),  // Piątek 7:00
      end: createDate(4, 15, 0),   // Piątek 15:00
      resource: 'TRK-001',
      orderDetails: { /* ... dane zlecenia ... */ }
    },
    {
      id: 3,
      title: 'TRK-001: Transport BASF Polska Sp. z o.o.',
      start: createDate(5, 6, 0),  // Sobota 6:00
      end: createDate(5, 14, 0),   // Sobota 14:00
      resource: 'TRK-001',
      orderDetails: { /* ... dane zlecenia ... */ }
    },
    {
      id: 9,
      title: 'TRK-001: Transport BASF cz.2',
      start: createDate(6, 6, 0),  // Niedziela 6:00
      end: createDate(6, 18, 0),   // Niedziela 18:00
      resource: 'TRK-001',
      orderDetails: { /* ... dane zlecenia ... */ }
    },
    // Wydarzenia dla TRK-002
    {
      id: 4,
      title: 'TRK-002: Transport Frosta Sp. z o.o.',
      start: createDate(1, 9, 0), // Wtorek 9:00
      end: createDate(2, 17, 0), // Środa 17:00
      resource: 'TRK-002',
      orderDetails: { /* ... dane zlecenia ... */ }
    },
    // Wydarzenia dla TRK-003
    {
      id: 5,
      title: 'TRK-003: Transport Orlen S.A.',
      start: createDate(0, 10, 0), // Poniedziałek 10:00
      end: createDate(1, 18, 0), // Wtorek 18:00
      resource: 'TRK-003',
      orderDetails: { /* ... dane zlecenia ... */ }
    },
    {
      id: 6,
      title: 'TRK-003: Przegląd techniczny',
      start: createDate(3, 9, 0), // Czwartek 9:00
      end: createDate(3, 13, 0), // Czwartek 13:00
      resource: 'TRK-003',
      orderDetails: { /* ... dane zlecenia ... */ }
    },
  ];
};
// --- Koniec przeniesionych funkcji ---

const Schedule = () => {
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '');
  // Stan dla wszystkich wydarzeń, zarządzany teraz w Schedule
  const [events, setEvents] = useState(() => generateAllTruckSchedules());
  const toast = useToast(); // Hook do powiadomień

  // --- Stan dla procesu optymalizacji ---
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [foundOffers, setFoundOffers] = useState([]); // [{ id, route, price, start, end, loadLocation, unloadLocation }]
  const [selectedOffers, setSelectedOffers] = useState({}); // { offerId: true/false }
  const [applicationResult, setApplicationResult] = useState(null); // { message: string }
  // --- Koniec stanu optymalizacji ---

  // Funkcja do dodawania nowego wydarzenia
  const addEvent = (newEvent) => {
    setEvents(prevEvents => [...prevEvents, newEvent]);
  };

  // Funkcja do obsługi kliknięcia 'Optymalizuj'
  const handleOptimizeClick = () => {
    if (!selectedVehicleId) {
      toast({ title: "Wybierz pojazd", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setIsLoadingOffers(true);
    setFoundOffers([]);
    setSelectedOffers({});
    setApplicationResult(null);

    // Symulacja wyszukiwania ofert (2 sekundy)
    setTimeout(() => {
      let gapStartLocation = 'Nieznana lokalizacja początkowa';
      let gapStartTime = null;
      let gapEndLocation = 'Nieznana lokalizacja końcowa';
      let gapEndTime = null;
      let mockOffers = [];

      // --- Logika znajdowania luki (Mockup dla TRK-001) ---
      if (selectedVehicleId === 'TRK-001') {
        const lastEventBeforeGap = events.find(e => e.id === 7 && e.resource === selectedVehicleId); // Wtorek 14:00, rozładunek Łódź
        const firstEventAfterGap = events.find(e => e.id === 2 && e.resource === selectedVehicleId); // Czwartek 7:00, załadunek Poznań

        if (lastEventBeforeGap && firstEventAfterGap) {
          gapStartLocation = lastEventBeforeGap.orderDetails.unloadLocation; // Łódź
          gapStartTime = lastEventBeforeGap.end; // Wt 14:00
          gapEndLocation = firstEventAfterGap.orderDetails.loadLocation; // Poznań
          gapEndTime = firstEventAfterGap.start; // Czw 7:00

          // Generowanie mockowych ofert pasujących do luki
           mockOffers = [
             // Oferty muszą się zaczynać po gapStartTime i kończyć przed gapEndTime
            { id: 'offer-1', route: `${gapStartLocation} -> ${gapEndLocation}`, price: '3.80 PLN/km', start: new Date(gapStartTime.getTime() + 2 * 60 * 60 * 1000), end: new Date(gapEndTime.getTime() - 15 * 60 * 60 * 1000), loadLocation: gapStartLocation, unloadLocation: gapEndLocation }, // Wt 16:00 -> Śr 16:00
            { id: 'offer-2', route: `${gapStartLocation} -> Miasto Pośrednie -> ${gapEndLocation}`, price: '3.50 PLN/km', start: new Date(gapStartTime.getTime() + 4 * 60 * 60 * 1000), end: new Date(gapEndTime.getTime() - 5 * 60 * 60 * 1000), loadLocation: gapStartLocation, unloadLocation: gapEndLocation }, // Wt 18:00 -> Czw 02:00
            { id: 'offer-3', route: `Inne Miasto -> ${gapEndLocation}`, price: '4.10 PLN/km', start: new Date(gapStartTime.getTime() + 18 * 60 * 60 * 1000), end: new Date(gapEndTime.getTime() - 2 * 60 * 60 * 1000), loadLocation: 'Inne Miasto', unloadLocation: gapEndLocation }, // Śr 08:00 -> Czw 05:00 - Nie pasuje do miejsca startu
            { id: 'offer-4', route: `${gapStartLocation} -> ${gapEndLocation} (Express)`, price: '4.50 PLN/km', start: new Date(gapStartTime.getTime() + 1 * 60 * 60 * 1000), end: new Date(gapEndTime.getTime() - 20 * 60 * 60 * 1000), loadLocation: gapStartLocation, unloadLocation: gapEndLocation } // Wt 15:00 -> Śr 11:00
          ].filter(offer => offer.loadLocation === gapStartLocation); // Filtrujemy, aby pasowały miejscem startu
           if(mockOffers.length === 0) {
                toast({ title: "Nie znaleziono pasujących ofert", description: `Brak ofert zaczynających się w ${gapStartLocation} i kończących w ${gapEndLocation} w wymaganym czasie.`, status: "info", duration: 5000, isClosable: true });
           }


        } else {
            console.warn("Nie znaleziono wydarzeń do określenia luki dla TRK-001");
             toast({ title: "Nie można określić luki", description: "Nie znaleziono wydarzeń przed i po potencjalnej luce dla tego pojazdu.", status: "warning", duration: 5000, isClosable: true });
        }
      } else {
           console.warn(`Logika znajdowania luki niezaimplementowana dla ${selectedVehicleId}`);
            toast({ title: "Funkcja niedostępna", description: `Optymalizacja nie jest jeszcze dostępna dla pojazdu ${selectedVehicleId}.`, status: "info", duration: 5000, isClosable: true });
      }
      // --- Koniec logiki znajdowania luki ---

      setFoundOffers(mockOffers);
      setIsLoadingOffers(false);
    }, 2000);
  };

  // Funkcja do obsługi zmiany checkboxa
  const handleCheckboxChange = (offerId) => {
    setSelectedOffers(prev => ({ ...prev, [offerId]: !prev[offerId] }));
  };

  // Funkcja do obsługi kliknięcia 'Aplikuj'
  const handleApplyClick = () => {
    const appliedOfferIds = Object.keys(selectedOffers).filter(id => selectedOffers[id]);
    if (appliedOfferIds.length === 0) {
      toast({ title: "Wybierz oferty do aplikowania", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    setIsApplying(true);
    setApplicationResult(null);

    // Symulacja aplikowania (3 sekundy)
    setTimeout(() => {
      // Wybierz jedną (np. pierwszą zaznaczoną) ofertę jako 'zaakceptowaną'
      const acceptedOfferId = appliedOfferIds[0];
      const acceptedOffer = foundOffers.find(offer => offer.id === acceptedOfferId);

      if (acceptedOffer) {
        // Stwórz nowe wydarzenie w kalendarzu
        const driverData = events.find(e => e.resource === selectedVehicleId)?.orderDetails.driver || 'Nieprzypisany';
        const newEvent = {
          id: `gap-${Date.now()}`, // Unikalne ID
          title: `${selectedVehicleId}: Wypełnienie luki (${acceptedOffer.route.split(' -> ')[1]})`, // Skrócony tytuł
          start: acceptedOffer.start,
          end: acceptedOffer.end,
          resource: selectedVehicleId,
          orderDetails: {
            orderNumber: `GAP-${acceptedOffer.id.slice(-3)}`,
            customer: 'Giełda Transportowa (Optymalizacja)',
            cargo: 'Ładunek z giełdy',
            loadLocation: acceptedOffer.loadLocation,
            unloadLocation: acceptedOffer.unloadLocation,
            driver: driverData,
            additionalInfo: `Oferta z giełdy, cena: ${acceptedOffer.price}`
          }
        };

        // Dodaj nowe wydarzenie do stanu
        addEvent(newEvent);

        // Ustaw wynik aplikacji
        setApplicationResult({ message: `Pomyślnie zaaplikowano i dodano do kalendarza: ${acceptedOffer.route}` });
        toast({ title: "Aplikacja udana", description: `Dodano zlecenie ${newEvent.title} do kalendarza.`, status: "success", duration: 5000, isClosable: true });

      } else {
         setApplicationResult({ message: 'Wystąpił błąd podczas aplikacji.' });
         toast({ title: "Błąd aplikacji", status: "error", duration: 5000, isClosable: true });
      }

      setIsApplying(false);
      setFoundOffers([]); // Wyczyść listę ofert po aplikacji
      setSelectedOffers({});
    }, 3000);
  };

  // Sprawdzenie, czy są zaznaczone oferty (do włączenia/wyłączenia przycisku Aplikuj)
  const hasSelectedOffers = Object.values(selectedOffers).some(isSelected => isSelected);

  const handleVehicleChange = (event) => {
    const newVehicleId = event.target.value;
    setSelectedVehicleId(newVehicleId);
    setFoundOffers([]);
    setSelectedOffers({});
    setApplicationResult(null);
    setIsLoadingOffers(false);
    setIsApplying(false);
  };

  return (
    <Box p={5}>
      <Heading as="h2" size="lg" mb={4}>
        Harmonogram Pojazdów
      </Heading>

      <HStack mb={4} spacing={4} align="flex-end">
        <FormControl w="300px">
          <Select
            placeholder="Wybierz pojazd..."
            value={selectedVehicleId}
            onChange={handleVehicleChange}
          >
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.id} - {vehicle.model}
              </option>
            ))}
          </Select>
        </FormControl>

        <Button
          onClick={handleOptimizeClick}
          isLoading={isLoadingOffers}
          loadingText="Szukam..."
          colorScheme="teal"
          variant="outline"
          isDisabled={!selectedVehicleId || isLoadingOffers || isApplying} 
        >
          Optymalizuj
        </Button>
      </HStack>

      <Box mt={6}>
        {isLoadingOffers && (
          <HStack spacing={3}>
            <Spinner size="md" color="teal.500" />
            <Text>Wyszukuję oferty pasujące do luki...</Text>
          </HStack>
        )}

        {!isLoadingOffers && foundOffers.length > 0 && !isApplying && !applicationResult && (
          <VStack align="stretch" spacing={4} borderWidth="1px" borderRadius="md" p={4}>
            <Heading size="sm">Znalezione oferty do wypełnienia luki:</Heading>
            {foundOffers.map(offer => (
              <HStack key={offer.id} justify="space-between" p={2} _hover={{ bg: "gray.50" }}>
                <Checkbox
                  isChecked={!!selectedOffers[offer.id]}
                  onChange={() => handleCheckboxChange(offer.id)}
                  colorScheme="teal"
                >
                  <Text fontSize="sm">
                    {offer.route} ({format(offer.start, 'HH:mm')}-{format(offer.end, 'HH:mm')})
                  </Text>
                </Checkbox>
                <Text fontSize="sm" fontWeight="medium">{offer.price}</Text>
              </HStack>
            ))}
            <Button
              onClick={handleApplyClick}
              colorScheme="teal"
              isDisabled={!hasSelectedOffers || isApplying} 
              alignSelf="flex-end" 
            >
              Aplikuj na zaznaczone
            </Button>
          </VStack>
        )}

        {isApplying && (
          <HStack spacing={3} mt={4}>
            <Spinner size="md" color="blue.500" />
            <Text>Aplikuję na wskazane oferty...</Text>
          </HStack>
        )}

        {applicationResult && !isApplying && (
          <Box mt={4} p={3} borderWidth="1px" borderRadius="md" borderColor="green.500" bg="green.50">
            <Text color="green.700" fontWeight="medium">{applicationResult.message}</Text>
          </Box>
        )}
        {!isLoadingOffers && foundOffers.length === 0 && !applicationResult && !isApplying && <Text mt={4} fontStyle="italic">Kliknij "Optymalizuj", aby wyszukać oferty.</Text>}
      </Box>

      <Box mt={6}>
        {selectedVehicleId ? (
          <TruckCalendar selectedVehicleId={selectedVehicleId} events={events} />
        ) : (
          <Text>Proszę wybrać pojazd, aby zobaczyć harmonogram.</Text>
        )}
      </Box>
    </Box>
  );
};

export default Schedule;
