import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  Divider,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Link,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Select,
  SimpleGrid, // Import SimpleGrid
} from '@chakra-ui/react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4002';
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const libraries = ['places']; // Needed for Autocomplete

// Helper function to extract address components
const extractAddressComponents = (addressComponents) => {
  let city = '';
  let postalCode = '';
  let country = '';

  if (!addressComponents) return { city, postalCode, country }; // Handle cases where components might be missing

  addressComponents.forEach(component => {
    const types = component.types;
    if (types.includes('locality') || types.includes('administrative_area_level_3')) {
      city = component.long_name;
    } else if (types.includes('postal_code')) {
      postalCode = component.long_name;
    } else if (types.includes('country')) {
      country = component.short_name; // Use short_name for country code
    }
  });

  return { city, postalCode, country };
};

// --- Vehicle Property Options (PLACEHOLDERS - Replace with actual Timocom values) ---
const vehicleBodyOptions = [
  { value: 'BOX', label: 'Kontener (Box)' },
  { value: 'CAR_TRANSPORTER', label: 'Transporter samochodów' },
  { value: 'CHASSIS', label: 'Podwozie' },
  { value: 'COIL_WELL', label: 'Mulda do przewozu kręgów' },
  { value: 'CURTAIN_SIDER', label: 'Firanka (Curtain sider)' },
  { value: 'DRAWER', label: 'Zabudowa szufladowa' }, // Assuming 'Drawer' refers to this type
  { value: 'DUMP_TRAILER', label: 'Wywrotka (Dump trailer)' },
  { value: 'EXTENDABLE_TRAILER', label: 'Naczepa rozciągana' },
  { value: 'FLATBED', label: 'Platforma (Flatbed)' },
  { value: 'INLOADER', label: 'Naczepa typu Inloader' },
  { value: 'JUMBO', label: 'Jumbo' },
  { value: 'LOW_LOADER', label: 'Naczepa niskopodwoziowa (Low loader)' },
  { value: 'MEGA', label: 'Mega' },
  { value: 'MOVING_FLOOR', label: 'Ruchoma podłoga' },
  { value: 'MOVING_FLOOR_FILL_MATERIAL', label: 'Ruchoma podłoga (materiał sypki)' },
  { value: 'PLATFORM', label: 'Platforma' },
  { value: 'REFRIGERATOR', label: 'Chłodnia' },
  { value: 'SEMI_TRAILER_WITH_INCLINED_TABLE', label: 'Naczepa ze stołem pochyłym' },
  { value: 'SILO', label: 'Silos' },
  { value: 'SPECIAL_TRUCK', label: 'Pojazd specjalny' },
  { value: 'SWAP_BODY_TRUCK', label: 'Pojazd pod zabudowę wymienną' },
  { value: 'TANK', label: 'Cysterna' },
  { value: 'TAUTLINER', label: 'Tautliner' },
  { value: 'THERMO', label: 'Termoizolowany' },
  { value: 'TIPPER_ROLL_OFF', label: 'Hakowiec (Tipper roll-off)' },
  { value: 'TRACTOR_UNIT', label: 'Ciągnik siodłowy' },
  { value: 'VAN_CAR', label: 'Furgon (Van)' },
];

const vehicleBodyPropertyOptions = [
  { value: 'AIR_SUSPENDED', label: 'Zawieszenie pneumatyczne' },
  { value: 'BACK_TIPPER', label: 'Wywrotka tylna' },
  { value: 'CODE_XL', label: 'Certyfikat CODE XL' },
  { value: 'DOUBLE_EVAPORATOR', label: 'Podwójny parownik' },
  { value: 'DOUBLE_FLOOR', label: 'Podwójna podłoga' },
  { value: 'ELEVATING_ROOF', label: 'Podnoszony dach' },
  { value: 'FOLDING_SIDE_BOX', label: 'Składana burta' },
  { value: 'HANGING_GARMENT_CONTAINER', label: 'Kontener na odzież wiszącą' },
  { value: 'LONG_TRUCK', label: 'Długi zestaw (Long truck)' },
  { value: 'LOW_FLOOR', label: 'Niska podłoga' },
  { value: 'LOW_LOADING_RAILS', label: 'Niskie szyny załadunkowe' },
  { value: 'REMOVAL_VAN', label: 'Furgon przeprowadzkowy' },
  { value: 'SLIDING_ROOF', label: 'Przesuwny dach' },
  { value: 'SLIDING_CURTAIN', label: 'Przesuwna kurtyna' },
  { value: 'SIDE_TIPPER', label: 'Wywrotka boczna' },
  { value: 'WIDENABLE', label: 'Poszerzany' },
];

const vehicleEquipmentOptions = [
  { value: 'ACCESS_RAMP', label: 'Rampa najazdowa' },
  { value: 'ADR_EQUIPMENT_SET', label: 'Zestaw wyposażenia ADR' },
  { value: 'A_PLATE', label: 'Tablica \'A\' (Odpady)' },
  { value: 'CUSTOMS_SEAL_STRING', label: 'Linka celna' },
  { value: 'ESCORT_VEHICLE_TYPE_3', label: 'Pojazd towarzyszący (Typ 3)' },
  { value: 'ESCORT_VEHICLE_TYPE_4', label: 'Pojazd towarzyszący (Typ 4)' },
  { value: 'FIXED_LOADING_CRANE', label: 'Żuraw załadunkowy (stały)' },
  { value: 'MEAT_HOOK', label: 'Haki na mięso' },
  { value: 'PARTITION_WALL', label: 'Ściana działowa' },
  { value: 'PORTABLE_FORKLIFT', label: 'Przenośny wózek widłowy' },
  { value: 'PORTABLE_PUMP_TRUCK', label: 'Przenośny wózek paletowy' },
  { value: 'SATELLITE_TRACKING', label: 'Śledzenie satelitarne' },
  { value: 'SECOND_DRIVER', label: 'Drugi kierowca' },
  { value: 'TAIL_LIFT', label: 'Winda załadunkowa' },
  { value: 'TARPAULIN_COVER', label: 'Plandeka' },
  { value: 'WOOD_STANCHIONS', label: 'Kłonice drewniane' },
];

const vehicleLoadSecuringOptions = [
  { value: 'ANTI_SLIP_MATS', label: 'Maty antypoślizgowe' },
  { value: 'BOARD_WALL', label: 'Ściana grodziowa' },
  { value: 'EDGE_PROTECTION', label: 'Ochrona krawędzi' },
  { value: 'LASHING_STRAPS', label: 'Pasy mocujące' },
  { value: 'LOCKING_BAR', label: 'Belka blokująca' },
  { value: 'PALLET_STOP_BAR', label: 'Listwa oporowa dla palet' },
  { value: 'PERFORATED_BATTEN', label: 'Listwa perforowana' },
  { value: 'STANCHIONS', label: 'Kłonice' },
  { value: 'TENSION_CHAIN', label: 'Łańcuch napinający' },
];

const vehicleSwapBodyOptions = [
  { value: 'FORTY_FEET_CONTAINER', label: 'Kontener 40 stóp' },
  { value: 'FORTY_FIVE_FEET_CONTAINER', label: 'Kontener 45 stóp' },
  { value: 'HALFPIPE_DUMPER', label: 'Wywrotka typu half-pipe' },
  { value: 'ROLL_ON_ROLL_OFF_CONTAINER', label: 'Kontener rolkowy (Roll-on/roll-off)' },
  { value: 'SWAP_BODY', label: 'Nadwozie wymienne (Swap body)' },
  { value: 'TWENTY_FEET_CONTAINER', label: 'Kontener 20 stóp' },
];

const vehicleTypeOptions = [
  { value: 'TRAILER', label: 'Naczepa' },
  { value: 'VEHICLE_UP_TO_12_T', label: 'Pojazd do 12 t' },
  { value: 'VEHICLE_UP_TO_3_5_T', label: 'Pojazd do 3,5 t' },
  { value: 'VEHICLE_UP_TO_7_5_T', label: 'Pojazd do 7,5 t' },
  { value: 'WAGGON_AND_DRAG', label: 'Zestaw (Ciężarówka + przyczepa)' }, // Commonly referred to as "Zestaw"
];

// --- End Vehicle Property Options ---

const QuickSearchPage = () => {
  const [startLocation, setStartLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // For API search loading
  const [error, setError] = useState(null);
  const toast = useToast();

  // Refs for Autocomplete components
  const startAutocompleteRef = useRef(null);
  const destinationAutocompleteRef = useRef(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-quicksearch', // Unique ID
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
    libraries: libraries,
  });

  // State for Vehicle Property Filters
  const [selectedBody, setSelectedBody] = useState('');
  const [selectedBodyProperty, setSelectedBodyProperty] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedLoadSecuring, setSelectedLoadSecuring] = useState('');
  const [selectedSwapBody, setSelectedSwapBody] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Handlers for Autocomplete
  const handleStartPlaceChanged = () => {
    if (startAutocompleteRef.current !== null) {
      const place = startAutocompleteRef.current.getPlace();
      
      // Sprawdź, czy place jest zdefiniowane i ma wszystkie potrzebne właściwości
      if (!place || !place.geometry || !place.geometry.location) {
        console.error("Autocomplete did not return valid place data for start location", place);
        toast({
          title: 'Niepełne dane miejsca',
          description: 'Nie można pobrać pełnych danych lokalizacji. Spróbuj wpisać dokładniejszy adres lub wybrać z listy podpowiedzi.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      const position = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      
      // Bezpieczne pobieranie komponentów adresu
      const addressDetails = extractAddressComponents(place.address_components || []);
      
      setStartLocation({
        name: place.formatted_address || place.name || `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`,
        address: place.formatted_address || place.name || `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`,
        city: addressDetails.city,
        postalCode: addressDetails.postalCode,
        country: addressDetails.country,
        latitude: position.lat,
        longitude: position.lng,
      });
      
      // Clear previous search results when location changes
      setSearchResults([]);
      setError(null);
    }
  };

  const handleDestinationPlaceChanged = () => {
    if (destinationAutocompleteRef.current !== null) {
      const place = destinationAutocompleteRef.current.getPlace();
      
      // Sprawdź, czy place jest zdefiniowane i ma wszystkie potrzebne właściwości
      if (!place || !place.geometry || !place.geometry.location) {
        console.error("Autocomplete did not return valid place data for destination location", place);
        toast({
          title: 'Niepełne dane miejsca',
          description: 'Nie można pobrać pełnych danych lokalizacji. Spróbuj wpisać dokładniejszy adres lub wybrać z listy podpowiedzi.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      const position = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      
      // Bezpieczne pobieranie komponentów adresu
      const addressDetails = extractAddressComponents(place.address_components || []);
      
      setDestinationLocation({
        name: place.formatted_address || place.name || `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`,
        address: place.formatted_address || place.name || `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`,
        city: addressDetails.city,
        postalCode: addressDetails.postalCode,
        country: addressDetails.country,
        latitude: position.lat,
        longitude: position.lng,
      });
      
      // Clear previous search results when location changes
      setSearchResults([]);
      setError(null);
    }
  };

  const onLoadStart = (autocomplete) => {
    startAutocompleteRef.current = autocomplete;
  };

  const onLoadDestination = (autocomplete) => {
    destinationAutocompleteRef.current = autocomplete;
  };

  // Search function
  const handleSearch = async () => {
    if (!startLocation || !destinationLocation || !startDate || !endDate) {
      toast({
        title: 'Brakujące informacje',
        description: 'Proszę wybrać punkt startowy, docelowy oraz daty.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setError(null); // Clear previous errors
    setIsLoading(true); // Set loading state to true
    setSearchResults([]); // Clear previous results

    // --- Ensure startDate and endDate are valid Date objects --- 
    let validStartDate = startDate instanceof Date ? startDate : new Date(startDate);
    let validEndDate = endDate instanceof Date ? endDate : new Date(endDate);

    // Check if conversion resulted in valid dates
    if (isNaN(validStartDate.getTime()) || isNaN(validEndDate.getTime())) {
       setError('Nieprawidłowy format daty.');
       setIsLoading(false);
       toast({
         title: 'Błąd daty',
         description: 'Wybrane daty są nieprawidłowe.',
         status: 'error',
         duration: 5000,
         isClosable: true,
       });
       return;
    }

    // --- Helper function to format date as YYYY-MM-DD ---
    const formatDate = (date) => date.toISOString().split('T')[0];

    // --- Helper function to get all dates between start and end ---
    const getDatesArray = (start, end) => {
      const dates = [];
      let currentDate = new Date(start);
      const stopDate = new Date(end);
      while (currentDate <= stopDate) {
        dates.push(formatDate(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dates;
    };

    // --- Calculate date range for top-level filtering (last 6 hours) ---
    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    // --- Construct the searchParams object required by the backend --- 
    const searchParams = {
      // --- Top-level creation time filter (last 6 hours, matching sample keys) ---
      exclusiveLeftLowerBoundDateTime: sixHoursAgo.toISOString(), // Use sample key
      inclusiveRightUpperBoundDateTime: now.toISOString(),      // Use sample key

      // --- Location filters (using areaSearch structure from sample) --- 
      startLocation: {
        objectType: "areaSearch", // Match sample
        area: {                   // Add area nesting
          address: {              // Keep inner address object
            objectType: "address",
            country: startLocation?.country, 
            city: startLocation?.city, 
            geoCoordinate: {
              latitude: startLocation?.latitude,
              longitude: startLocation?.longitude
            }
          },
          size_km: 50           // Match sample
        }
      },
      destinationLocation: {
        objectType: "areaSearch", // Match sample
        area: {                   // Add area nesting
          address: {              // Keep inner address object
            objectType: "address",
            country: destinationLocation?.country, 
            city: destinationLocation?.city, 
            geoCoordinate: {
              latitude: destinationLocation?.latitude,
              longitude: destinationLocation?.longitude
            }
          },
          size_km: 50           // Match sample
        }
      },
      // --- Add Loading Date filter (using individualDates structure) ---
      loadingDate: {
        objectType: 'individualDates',
        dates: getDatesArray(validStartDate, validEndDate) // Generate date array
      },

      // --- Add Sorting (from sample) ---
      sortings: [
        {
          ascending: true,
          field: "loadingDate"
        }
      ],

      // --- Add Pagination (from sample) ---
      firstResult: 0,
      maxResults: 30
    };

    // --- Add Vehicle Properties conditionally ---
    const vehicleProperties = {};
    if (selectedBody) vehicleProperties.body = [selectedBody];
    if (selectedBodyProperty) vehicleProperties.bodyProperty = [selectedBodyProperty];
    if (selectedEquipment) vehicleProperties.equipment = [selectedEquipment];
    if (selectedLoadSecuring) vehicleProperties.loadSecuring = [selectedLoadSecuring];
    if (selectedSwapBody) vehicleProperties.swapBody = [selectedSwapBody];
    if (selectedType) vehicleProperties.type = [selectedType];

    // Only add vehicleProperties object if it's not empty
    if (Object.keys(vehicleProperties).length > 0) {
      searchParams.vehicleProperties = vehicleProperties;
    }
    // --- End Vehicle Properties ---

    console.log('Sending searchParams:', JSON.stringify(searchParams, null, 2));

    try {
      // Send the searchParams object nested under the 'searchParams' key
      const response = await axios.post(`${API_BASE_URL}/search-offers`, { // Remove /api prefix
        searchParams: searchParams 
      });

      console.log("API Response:", response.data);

      // --- Correctly access the offers from response.data.data.payload ---
      if (response.data && response.data.success && Array.isArray(response.data?.data?.payload)) {
        const offers = response.data.data.payload;
        setSearchResults(offers); 
        if (offers.length === 0) {
          console.log("IF BLOCK - No offers found, showing info toast."); // ADD THIS LOG
          // Optionally use toast or set error for no results
          toast({
            title: 'Brak wyników', 
            description: 'Nie znaleziono ofert dla podanych kryteriów.', 
            status: 'info', 
            duration: 5000, 
            isClosable: true 
          });
        } else {
          console.log(`IF BLOCK - ${offers.length} offers found, setting state.`); // ADD THIS LOG
        }
      } else {
        console.log("ELSE BLOCK EXECUTED - Condition failed:", { // ADD THIS LOG
          hasResponseData: !!response.data,
          isSuccess: response.data?.success,
          isPayloadArray: Array.isArray(response.data?.data?.payload)
        });
        const errorMsg = response.data?.error || 'Otrzymano nieprawidłową odpowiedź z serwera.';
        setError(errorMsg); 
        setSearchResults([]); 
        toast({ 
          title: 'Błąd odpowiedzi', 
          description: errorMsg, 
          status: 'warning', 
          duration: 7000, 
          isClosable: true 
        });
      }

    } catch (err) {
      console.error("Error searching offers:", err);
      // Extract error message from backend response if available
      const backendError = err.response?.data?.error || 'Wystąpił błąd podczas wyszukiwania ofert.';
      const backendDetails = err.response?.data?.details;
      setError(`${backendError}${backendDetails ? ' Szczegóły: ' + JSON.stringify(backendDetails) : ''}`); 
      setSearchResults([]); // Clear results on error
      toast({ 
        title: 'Błąd wyszukiwania', 
        description: backendError, 
        status: 'error', 
        duration: 9000, 
        isClosable: true 
      });
    } finally {
      setIsLoading(false); // Set loading state to false regardless of success or error
    }
  };

  // Helper functions for rendering
  const formatDate = (dateString) => {
    if (!dateString) return 'Brak daty';
    try {
      // Ensure the date is treated as UTC to avoid timezone issues with simple yyyy-mm-dd strings
      const date = new Date(dateString + 'T00:00:00Z');
      return date.toLocaleDateString('pl-PL', { timeZone: 'UTC' });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Nieprawidłowa data';
    }
  };

  const calculateProfitability = (offer) => {
    // Correctly access price amount - remove financials fallback
    const priceAmount = offer.price?.amount;
    // Distance is correct
    const distance = offer.distance_km;

    if (!priceAmount || !distance || distance <= 0) {
      return 0;
    }
    const numericPrice = parseFloat(priceAmount);
    if (isNaN(numericPrice)) {
        return 0;
    }
    return numericPrice / distance;
  };

  const renderOfferDetails = (offer) => {
    const ratePerKm = calculateProfitability(offer);

    // Find loading and unloading places from the array
    const loadingPlace = offer.loadingPlaces?.find(p => p.loadingType === 'LOADING');
    const unloadingPlace = offer.loadingPlaces?.find(p => p.loadingType === 'UNLOADING');

    // Extract details safely using optional chaining
    const originCity = loadingPlace?.address?.city || 'Nieznane';
    const originPostalCode = loadingPlace?.address?.postalCode || '';
    const originCountry = loadingPlace?.address?.country || '';
    const destinationCity = unloadingPlace?.address?.city || 'Nieznane';
    const destinationPostalCode = unloadingPlace?.address?.postalCode || '';
    const destinationCountry = unloadingPlace?.address?.country || '';

    // Extract additional details
    const vehicleTypes = offer.vehicleProperties?.type?.join(', ') || 'Brak';
    const vehicleBodies = offer.vehicleProperties?.body?.join(', ') || 'Brak';
    const loadLength = offer.length_m ? `${offer.length_m} m` : 'Brak';
    const freightDesc = offer.freightDescription || 'Brak opisu';
    const timocomLink = offer.deeplink;

    const route = `${originCity} ${originPostalCode} ${originCountry} -> ${destinationCity} ${destinationPostalCode} ${destinationCountry}`;
    
    // Correct price string logic - remove financials fallback
    const priceString = offer.price ? `${offer.price.amount} ${offer.price.currency}` : 'Brak ceny';
    
    // Get dates from the correct places
    const loadingDateStr = loadingPlace?.earliestLoadingDate; // Use earliest for now
    const deliveryDateStr = unloadingPlace?.earliestLoadingDate; // Use earliest from unloading place

    return (
      <Box key={offer.id} borderWidth="1px" borderRadius="lg" p={4} mb={4} bg="white" shadow="sm">
        <HStack justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Text fontWeight="bold">{route}</Text>
          <VStack alignItems="flex-end" spacing={1}>
            <Text fontWeight="bold" color={ratePerKm > 0 ? 'green.500' : 'gray.500'}>
              {ratePerKm > 0 ? `${ratePerKm.toFixed(2)} EUR/km` : (priceString !== 'Brak ceny' ? 'Brak dystansu' : 'Brak danych')}
            </Text>
            {timocomLink && (
              <Button as={Link} href={timocomLink} isExternal size="xs" colorScheme="teal" variant="outline">
                Zobacz w Timocom
              </Button>
            )}
          </VStack>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontSize="sm">Cena: {priceString}</Text>
          <Text fontSize="sm">Dystans: {offer.distance_km || 'Brak'} km</Text>
        </HStack>
        <HStack justifyContent="space-between" mt={1}>
            <Text fontSize="sm">Typ pojazdu: {vehicleTypes}</Text>
            <Text fontSize="sm">Zabudowa: {vehicleBodies}</Text>
        </HStack>
        <HStack justifyContent="space-between" mt={1}>
           <Text fontSize="sm">Długość ład.: {loadLength}</Text>
           <Text fontSize="sm">Waga ład.: {offer.weight_t || 'Brak'} t</Text> {/* Added weight */}
        </HStack>
         <HStack justifyContent="space-between" mt={1}>
           {/* Use the correctly extracted dates */}
           <Text fontSize="sm">Załadunek: {formatDate(loadingDateStr)}</Text>
           <Text fontSize="sm">Rozładunek: {formatDate(deliveryDateStr)}</Text>
         </HStack>
        {freightDesc !== 'Brak opisu' && (
          <Box mt={2} pt={2} borderTop="1px" borderColor="gray.200">
            <Text fontSize="sm">Opis: {freightDesc}</Text>
          </Box>
        )}
      </Box>
    );
  };

  // Filter and sort results
  const validOffers = searchResults.filter(offer => calculateProfitability(offer) > 0);
  const sortedOffers = [...validOffers].sort((a, b) => calculateProfitability(b) - calculateProfitability(a));
  const offersWithoutPriceOrDistance = searchResults.filter(offer => calculateProfitability(offer) <= 0);

  // Render logic for API loading/error states
  if (loadError) {
    return (
      <Box p={5}>
        <Alert status="error">
          <AlertIcon />
          Błąd ładowania Google Maps API: {typeof loadError === 'string' ? loadError : (loadError.message || 'Sprawdź konfigurację klucza API i połączenie internetowe.')}
        </Alert>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box p={5} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Ładowanie komponentów mapy...</Text>
      </Box>
    );
  }

  // Main component render
  return (
    <Box p={5}>
      <Heading as="h2" size="lg" mb={6}>
        Szybkie wyszukiwanie ofert transportowych
      </Heading>

      <VStack spacing={6} align="stretch" mb={8}>
        <HStack spacing={6} align="start">
          {/* Start Location Autocomplete */}
          <FormControl id="start-location" flex={1}>
            <FormLabel>Punkt startowy</FormLabel>
            <Autocomplete
              onLoad={onLoadStart}
              onPlaceChanged={handleStartPlaceChanged}
              options={{
                 // Example: Restrict to specific countries
                 componentRestrictions: { country: ["pl", "de", "cz", "sk", "fr", "es", "it", "nl", "be", "at", "ch", "lu"] },
                 fields: ["address_components", "geometry", "formatted_address", "name"], // Request necessary fields
              }}
            >
              <Input
                placeholder="Wpisz adres lub nazwę miejsca..."
                bg="white"
                // Clear location state if user manually clears input (optional)
                // onChange={(e) => { if (e.target.value === '') setStartLocation(null); }}
              />
            </Autocomplete>
            {startLocation && <Text mt={2} fontSize="sm" color="gray.600">Wybrano: {startLocation.name}</Text>}
          </FormControl>

          {/* Destination Location Autocomplete */}
          <FormControl id="destination-location" flex={1}>
            <FormLabel>Punkt docelowy</FormLabel>
            <Autocomplete
              onLoad={onLoadDestination}
              onPlaceChanged={handleDestinationPlaceChanged}
              options={{
                 componentRestrictions: { country: ["pl", "de", "cz", "sk", "fr", "es", "it", "nl", "be", "at", "ch", "lu"] },
                 fields: ["address_components", "geometry", "formatted_address", "name"],
              }}
            >
              <Input
                placeholder="Wpisz adres lub nazwę miejsca..."
                bg="white"
              />
            </Autocomplete>
            {destinationLocation && <Text mt={2} fontSize="sm" color="gray.600">Wybrano: {destinationLocation.name}</Text>}
          </FormControl>
        </HStack>

        <HStack spacing={6}>
          <FormControl id="start-date" isRequired>
            <FormLabel>Data załadunku od</FormLabel>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </FormControl>
          <FormControl id="end-date" isRequired>
            <FormLabel>Data załadunku do</FormLabel>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </FormControl>
        </HStack>

        {/* Vehicle Properties Accordion */}
        <Accordion allowMultiple allowToggle width="100%">
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Opcje pojazdu (opcjonalne)
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              {/* Use SimpleGrid for two columns */}
              <SimpleGrid columns={2} spacing={4}>
                {/* Body Type */}
                <FormControl>
                  <FormLabel fontSize="sm">Rodzaj zabudowy</FormLabel>
                  <Select placeholder="Dowolny" value={selectedBody} onChange={(e) => setSelectedBody(e.target.value)}>
                    {vehicleBodyOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </FormControl>

                {/* Body Property */}
                <FormControl>
                  <FormLabel fontSize="sm">Właściwości zabudowy</FormLabel>
                  <Select placeholder="Dowolny" value={selectedBodyProperty} onChange={(e) => setSelectedBodyProperty(e.target.value)}>
                    {vehicleBodyPropertyOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </FormControl>

                {/* Equipment */}
                <FormControl>
                  <FormLabel fontSize="sm">Wyposażenie dodatkowe</FormLabel>
                  <Select placeholder="Dowolny" value={selectedEquipment} onChange={(e) => setSelectedEquipment(e.target.value)}>
                    {vehicleEquipmentOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </FormControl>

                {/* Load Securing */}
                <FormControl>
                  <FormLabel fontSize="sm">Zabezpieczenie ładunku</FormLabel>
                  <Select placeholder="Dowolny" value={selectedLoadSecuring} onChange={(e) => setSelectedLoadSecuring(e.target.value)}>
                    {vehicleLoadSecuringOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </FormControl>

                {/* Swap Body */}
                <FormControl>
                  <FormLabel fontSize="sm">Kontener wymienny</FormLabel>
                  <Select placeholder="Dowolny" value={selectedSwapBody} onChange={(e) => setSelectedSwapBody(e.target.value)}>
                    {vehicleSwapBodyOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </FormControl>

                {/* Vehicle Type */}
                <FormControl>
                  <FormLabel fontSize="sm">Typ pojazdu</FormLabel>
                  <Select placeholder="Dowolny" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                    {vehicleTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Button 
          colorScheme="blue" 
          onClick={handleSearch} 
          isLoading={isLoading} 
          loadingText="Wyszukiwanie..."
          isDisabled={!startLocation || !destinationLocation || !startDate || !endDate}
        >
          Szukaj ofert
        </Button>
      </VStack>

      <Divider my={6} />

      {/* Wyniki wyszukiwania */}
      <Box>
        <Heading as="h3" size="md" mb={4}>
          Wyniki wyszukiwania
        </Heading>

        {isLoading && (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
            <Text mt={4}>Wyszukiwanie ofert...</Text>
          </Box>
        )}

        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {!isLoading && !error && searchResults.length === 0 && (
          <Text>Brak wyników wyszukiwania. Wybierz lokalizacje i daty, a następnie kliknij "Szukaj ofert".</Text>
        )}

        {!isLoading && !error && sortedOffers.length > 0 && (
          <VStack spacing={4} align="stretch" mb={4}>
            <Text fontWeight="medium">Znaleziono {sortedOffers.length} ofert z ceną i dystansem:</Text>
            {sortedOffers.map(offer => renderOfferDetails(offer))}
          </VStack>
        )}

        {!isLoading && !error && offersWithoutPriceOrDistance.length > 0 && (
          <VStack spacing={4} align="stretch">
            <Text fontWeight="medium" color="gray.600">Oferty bez ceny lub dystansu ({offersWithoutPriceOrDistance.length}):</Text>
            {offersWithoutPriceOrDistance.map(offer => renderOfferDetails(offer))}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default QuickSearchPage;