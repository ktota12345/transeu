import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Input, 
  InputGroup, 
  InputRightElement, 
  Text, 
  HStack, 
  VStack, 
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  FormControl
} from '@chakra-ui/react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { FiSearch } from 'react-icons/fi';

// Klucz API Google Maps - pobierany z zmiennych środowiskowych
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Sprawdzenie czy klucz API istnieje
const hasApiKey = !!GOOGLE_MAPS_API_KEY;

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 52.229676,
  lng: 21.012229
};

// Funkcja pomocnicza do wyodrębniania komponentów adresu
const extractAddressComponents = (addressComponents) => {
  let city = '';
  let postalCode = '';
  let country = ''; // Będziemy przechowywać kod kraju (np. PL, DE)

  addressComponents.forEach(component => {
    const types = component.types;
    if (types.includes('locality') || types.includes('administrative_area_level_3')) {
      city = component.long_name;
    } else if (types.includes('postal_code')) {
      postalCode = component.long_name;
    } else if (types.includes('country')) {
      country = component.short_name; // Używamy short_name dla kodu kraju
    }
  });

  return { city, postalCode, country };
};

const GoogleMapPicker = ({ initialPosition, onPositionSelected }) => {
  const [searchAddress, setSearchAddress] = useState('');
  const [center, setCenter] = useState(initialPosition || defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(initialPosition || defaultCenter);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loadError, setLoadError] = useState(null);
  const [manualCoordinates, setManualCoordinates] = useState({
    lat: initialPosition?.lat || defaultCenter.lat,
    lng: initialPosition?.lng || defaultCenter.lng
  });
  
  const mapRef = useRef(null);
  const toast = useToast();
  
  // Sprawdzenie czy klucz API istnieje i wyświetlenie ostrzeżenia jeśli nie
  useEffect(() => {
    if (!hasApiKey) {
      setLoadError('Brak klucza API Google Maps. Mapa nie zostanie załadowana.');
      toast({
        title: 'Brak klucza API',
        description: 'Klucz API Google Maps nie jest skonfigurowany. Funkcje mapy są ograniczone.',
        status: 'warning',
        duration: 9000,
        isClosable: true,
      });
    }
  }, [toast]);
  
  // Ładowanie Google Maps API tylko jeśli klucz API istnieje
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',  // Pusty string jeśli brak klucza
    libraries: ['places'],
    onError: (error) => {
      console.error('Błąd ładowania Google Maps API:', error);
      setLoadError(`Błąd ładowania Google Maps API: ${error.message}`);
    }
  });
  
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);
  
  const onMapClick = useCallback((event) => {
    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    setMarkerPosition(newPosition);
    
    // Przekształcenie współrzędnych na adres (geocoding odwrotny)
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: newPosition }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setSelectedAddress(results[0].formatted_address);
        
        const addressDetails = extractAddressComponents(results[0].address_components);
        
        // Wywołanie funkcji zwrotnej z nowymi danymi
        onPositionSelected({
          coordinates: newPosition,
          address: {
            full: results[0].formatted_address,
            city: addressDetails.city,
            postalCode: addressDetails.postalCode,
            country: addressDetails.country
          }
        });
      }
    });
  }, [onPositionSelected]);
  
  const handleSearch = () => {
    if (!searchAddress) return;
    
    // Przekształcenie adresu na współrzędne (geocoding)
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchAddress }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const position = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };
        
        setCenter(position);
        setMarkerPosition(position);
        setSelectedAddress(results[0].formatted_address);
        
        const addressDetails = extractAddressComponents(results[0].address_components);
        
        // Wywołanie funkcji zwrotnej z nowymi danymi
        onPositionSelected({
          coordinates: position,
          address: {
            full: results[0].formatted_address,
            city: addressDetails.city,
            postalCode: addressDetails.postalCode,
            country: addressDetails.country
          }
        });
      }
    });
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Obsługa ręcznego wprowadzania współrzędnych
  const handleManualCoordinateChange = (e) => {
    const { name, value } = e.target;
    setManualCoordinates(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const applyManualCoordinates = () => {
    const newPosition = {
      lat: manualCoordinates.lat,
      lng: manualCoordinates.lng
    };
    
    setMarkerPosition(newPosition);
    setCenter(newPosition);
    
    // Wywołanie funkcji zwrotnej z nowymi danymi
    onPositionSelected({
      coordinates: newPosition,
      address: {
        full: `Współrzędne: ${newPosition.lat.toFixed(6)}, ${newPosition.lng.toFixed(6)}`,
        city: '',
        postalCode: '',
        country: ''
      }
    });
    
    toast({
      title: 'Zastosowano współrzędne',
      description: `Ustawiono pozycję na: ${newPosition.lat.toFixed(6)}, ${newPosition.lng.toFixed(6)}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={4} align="stretch">
      {loadError && (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Uwaga!</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}
      
      <InputGroup>
        <Input
          placeholder="Wyszukaj adres..."
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          onKeyDown={handleKeyDown}
          isDisabled={!isLoaded || !!loadError}
        />
        <InputRightElement>
          <Button 
            size="sm" 
            onClick={handleSearch}
            isDisabled={!isLoaded || !!loadError}
          >
            <FiSearch />
          </Button>
        </InputRightElement>
      </InputGroup>
      
      {/* Formularz ręcznego wprowadzania współrzędnych */}
      <Box p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
        <Text fontWeight="medium" mb={2}>Ręczne wprowadzanie współrzędnych:</Text>
        <HStack spacing={4} mb={2}>
          <FormControl>
            <InputGroup size="sm">
              <Input
                name="lat"
                placeholder="Szerokość (np. 52.229676)"
                value={manualCoordinates.lat}
                onChange={handleManualCoordinateChange}
                type="number"
                step="0.000001"
              />
            </InputGroup>
          </FormControl>
          <FormControl>
            <InputGroup size="sm">
              <Input
                name="lng"
                placeholder="Długość (np. 21.012229)"
                value={manualCoordinates.lng}
                onChange={handleManualCoordinateChange}
                type="number"
                step="0.000001"
              />
            </InputGroup>
          </FormControl>
        </HStack>
        <Button size="sm" colorScheme="blue" onClick={applyManualCoordinates}>
          Zastosuj współrzędne
        </Button>
      </Box>
      
      <Box borderRadius="md" overflow="hidden" borderWidth="1px">
        {isLoaded && !loadError ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={15}
            onClick={onMapClick}
            onLoad={onMapLoad}
          >
            <Marker position={markerPosition} />
          </GoogleMap>
        ) : (
          <Box height="400px" display="flex" alignItems="center" justifyContent="center" bg="gray.100">
            {loadError ? (
              <Text color="red.500">Nie można załadować mapy. Użyj ręcznego wprowadzania współrzędnych.</Text>
            ) : (
              <Text>Ładowanie mapy...</Text>
            )}
          </Box>
        )}
      </Box>
      
      {selectedAddress && (
        <Text fontSize="sm">
          Wybrany adres: <strong>{selectedAddress}</strong>
        </Text>
      )}
      
      <HStack spacing={4}>
        <Text fontSize="sm" fontWeight="medium">Współrzędne:</Text>
        <Text fontSize="sm">
          Szerokość: <strong>{markerPosition.lat.toFixed(6)}</strong>
        </Text>
        <Text fontSize="sm">
          Długość: <strong>{markerPosition.lng.toFixed(6)}</strong>
        </Text>
      </HStack>
    </VStack>
  );
};

export default GoogleMapPicker;
