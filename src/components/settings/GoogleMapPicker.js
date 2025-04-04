import React, { useState, useCallback, useRef } from 'react';
import { Box, Button, Input, InputGroup, InputRightElement, Text, HStack, VStack } from '@chakra-ui/react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { FiSearch } from 'react-icons/fi';

// Klucz API Google Maps - w rzeczywistej aplikacji powinien być przechowywany w zmiennych środowiskowych
// i nie powinien być umieszczany bezpośrednio w kodzie
const GOOGLE_MAPS_API_KEY = "AIzaSyBU2valhDPZA7p-cA4MVgZe8CNjcMjaph8";

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
  
  const mapRef = useRef(null);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
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
  
  return (
    <VStack spacing={4} align="stretch">
      <InputGroup>
        <Input
          placeholder="Wyszukaj adres..."
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <InputRightElement>
          <Button size="sm" onClick={handleSearch}>
            <FiSearch />
          </Button>
        </InputRightElement>
      </InputGroup>
      
      <Box borderRadius="md" overflow="hidden" borderWidth="1px">
        {isLoaded ? (
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
          <Box height="400px" display="flex" alignItems="center" justifyContent="center">
            <Text>Ładowanie mapy...</Text>
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
