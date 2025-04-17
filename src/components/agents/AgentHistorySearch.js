import React from 'react';
import { Box, Flex, Text, Badge, Link, Icon, Tooltip, VStack, Heading, Alert, AlertIcon, Stat, StatLabel, StatNumber, HStack, Wrap, Tag } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { FiTruck, FiExternalLink } from 'react-icons/fi';

const formatDate = (dateStr) => {
  if (!dateStr) return '?';
  return new Date(dateStr).toLocaleDateString('pl-PL');
};

const formatExplicitRange = (earliestDate, latestDate, startTime, endTime) => {
  const startD = formatDate(earliestDate);
  const endD = formatDate(latestDate);
  const startFull = startTime ? `${startD} ${startTime}` : startD;
  const endFull = endTime ? `${endD} ${endTime}` : endD;
  if (startD === '?' && endD === '?') return null;
  if (startD === '?') return `do ${endFull}`;
  if (endD === '?') return `od ${startFull}`;
  return `${startFull} - ${endFull}`;
};

const OfferItem = React.memo(({ offer }) => {
  const loadingPlace = offer.loadingPlaces?.find(p => p.loadingType === 'LOADING');
  const unloadingPlace = offer.loadingPlaces?.find(p => p.loadingType === 'UNLOADING');

  const earliestLoadDate = loadingPlace?.earliestLoadingDate;
  const latestLoadDate = loadingPlace?.latestLoadingDate;
  const loadStartTime = loadingPlace?.startTime;
  const loadEndTime = loadingPlace?.endTime;

  const earliestUnloadDate = unloadingPlace?.earliestLoadingDate;
  const latestUnloadDate = unloadingPlace?.latestLoadingDate;
  const unloadStartTime = unloadingPlace?.startTime;
  const unloadEndTime = unloadingPlace?.endTime;

  const loadCity = loadingPlace?.address?.city || 'N/A';
  const unloadCity = unloadingPlace?.address?.city || 'N/A';

  const loadRangeFormatted = formatExplicitRange(earliestLoadDate, latestLoadDate, loadStartTime, loadEndTime);
  const unloadRangeFormatted = formatExplicitRange(earliestUnloadDate, latestUnloadDate, unloadStartTime, unloadEndTime);

  // Obliczanie stawki za km w oryginalnej walucie
  let ratePerKm = null;
  if (offer.price && typeof offer.price.amount === 'number' && typeof offer.distance_km === 'number' && offer.distance_km > 0) {
      ratePerKm = (offer.price.amount / offer.distance_km).toFixed(2);
  }

  // Obliczanie stawki za km w PLN
  let ratePlnPerKm = null;
  const exchangeRateEurToPln = 4.3;
  if (ratePerKm !== null) {
      if (offer.price.currency === 'EUR') {
          ratePlnPerKm = (parseFloat(ratePerKm) * exchangeRateEurToPln).toFixed(2);
      } else if (offer.price.currency === 'PLN') {
          ratePlnPerKm = ratePerKm; // Już jest w PLN
      }
      // Można dodać obsługę innych walut, jeśli potrzeba
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" mb={3} position="relative">
      <Flex justify="space-between" align="flex-start">
        <Box flex="1" mr={4}>
          <Text fontWeight="bold" mb={1}>{loadCity} → {unloadCity}</Text>
          <Text fontSize="sm" color="gray.600" mb={1}>
            {offer.freightDescription || 'Brak opisu'} ({offer.weight_t ? `${offer.weight_t}t` : 'N/A'}, {offer.length_m ? `${offer.length_m}m` : 'N/A'})
          </Text>
          <Text fontSize="sm" color="gray.600">
            Dystans: {offer.distance_km || 'N/A'} km
          </Text>
          {loadRangeFormatted && (
            <Text fontSize="xs" color="gray.500" mt={1}>Załadunek: {loadRangeFormatted}</Text>
          )}
          {unloadRangeFormatted && (
            <Text fontSize="xs" color="gray.500" mt={1}>Rozładunek: {unloadRangeFormatted}</Text>
          )}
        </Box>

        <Box textAlign="right">
          {ratePerKm !== null ? (
            <Text fontWeight="bold" fontSize="lg" color="gray.800">
              {ratePerKm} {offer.price.currency}/km
            </Text>
          ) : (
            <Text fontSize="sm" color="gray.500">Brak stawki</Text>
          )}
          {/* Dodatkowe wyświetlanie stawki w PLN */}
          {ratePlnPerKm !== null && (
            <Text fontSize="sm" color="gray.600">
              (~ {ratePlnPerKm} PLN/km)
            </Text>
          )}
          {(offer.price && typeof offer.price.amount === 'number') ? (
            <Text fontSize="sm" color="gray.500">{offer.price.amount} {offer.price.currency}</Text>
          ) : (
            <Text fontSize="sm" color="gray.500">Brak ceny</Text>
          )}
          {offer.deeplink && (
            <Link href={offer.deeplink} isExternal mt={2} display="block" fontSize="xs">
              Zobacz w Timocom <ExternalLinkIcon mx="2px" />
            </Link>
          )}
        </Box>
      </Flex>
    </Box>
  );
});

const AgentHistorySearch = ({ offers }) => {
  if (!offers || offers.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        Brak ofert do wyświetlenia. Użyj przycisku "Szukaj Ofert", aby pobrać nowe dane.
      </Alert>
    );
  }

  // Sortowanie ofert malejąco według stawki PLN/km
  const sortedOffers = [...offers].sort((a, b) => {
    const exchangeRateEurToPln = 4.3;
    // Funkcja pomocnicza do obliczania stawki PLN dla sortowania
    const getPlnRate = (offer) => {
        if (offer.price && typeof offer.price.amount === 'number' && typeof offer.distance_km === 'number' && offer.distance_km > 0) {
            const rate = offer.price.amount / offer.distance_km;
            if (offer.price.currency === 'EUR') {
                return rate * exchangeRateEurToPln;
            } else if (offer.price.currency === 'PLN') {
                return rate;
            }
        }
        return -Infinity; // Oferty bez ceny lub w innej walucie na koniec
    };

    const rateAPln = getPlnRate(a);
    const rateBPln = getPlnRate(b);

    return rateBPln - rateAPln; // Malejąco
  });

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md">Znalezione Oferty ({offers.length})</Heading>
      {/* Mapowanie POSORTOWANEJ tablicy offers */}
      {sortedOffers.map((offer) => (
        <OfferItem key={offer.id} offer={offer} />
      ))}
    </VStack>
  );
};

export default AgentHistorySearch;
