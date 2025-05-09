import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import PropTypes from 'prop-types';

// Funkcja do ładowania Google Maps API
const loadGoogleMapsScript = (callback) => {
  const existingScript = document.getElementById('googleMapsScript');
  if (!existingScript) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.id = 'googleMapsScript';
    document.body.appendChild(script);
    script.onload = () => {
      if (callback) callback();
    };
  } else if (callback) {
    callback();
  }
};

const MapContainer = ({ location, onLocationSelect, interactive = false, markers = [] }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Inicjalizacja mapy
  useEffect(() => {
    loadGoogleMapsScript(() => {
      try {
        if (!window.google) {
          setError('Nie udało się załadować Google Maps API. Sprawdź klucz API i połączenie z internetem.');
          return;
        }

        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: location.lat, lng: location.lng },
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true
        });

        // Dodaj markery
        const mainMarker = new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: mapInstance,
          draggable: interactive
        });

        setMap(mapInstance);
        setMarker(mainMarker);
        setMapLoaded(true);

        // Dodaj obsługę zdarzeń dla markera jeśli mapa jest interaktywna
        if (interactive) {
          mainMarker.addListener('dragend', () => {
            const position = mainMarker.getPosition();
            if (onLocationSelect) {
              onLocationSelect({
                lat: position.lat(),
                lng: position.lng()
              });
            }
          });

          // Kliknięcie na mapie przesuwa marker
          mapInstance.addListener('click', (e) => {
            const clickedPosition = e.latLng;
            mainMarker.setPosition(clickedPosition);
            if (onLocationSelect) {
              onLocationSelect({
                lat: clickedPosition.lat(),
                lng: clickedPosition.lng()
              });
            }
          });
        }
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Wystąpił błąd podczas inicjalizacji mapy. Spróbuj ponownie później.');
      }
    });

    return () => {
      // Cleanup
      if (map) {
        // Bezpieczne czyszczenie zasobów mapy
      }
    };
  }, []);

  // Aktualizuj pozycję markera gdy zmieni się lokalizacja
  useEffect(() => {
    if (map && marker && location) {
      const newPosition = new window.google.maps.LatLng(location.lat, location.lng);
      marker.setPosition(newPosition);
      map.panTo(newPosition);
    }
  }, [location, map, marker]);

  // Dodaj dodatkowe markery na mapie
  useEffect(() => {
    if (map && mapLoaded && markers.length > 0) {
      // Usuń poprzednie markery
      markers.forEach(existingMarker => {
        if (existingMarker._mapMarker) {
          existingMarker._mapMarker.setMap(null);
        }
      });

      // Dodaj nowe markery
      markers.forEach(markerData => {
        if (markerData.latitude && markerData.longitude) {
          const mapMarker = new window.google.maps.Marker({
            position: { 
              lat: parseFloat(markerData.latitude), 
              lng: parseFloat(markerData.longitude) 
            },
            map: map,
            title: markerData.title || '',
            icon: markerData.icon
          });

          // Zapisz referencję dla późniejszego czyszczenia
          markerData._mapMarker = mapMarker;

          // Dodaj infowindow jeśli są informacje do wyświetlenia
          if (markerData.info) {
            const infowindow = new window.google.maps.InfoWindow({
              content: markerData.info
            });

            mapMarker.addListener('click', () => {
              infowindow.open(map, mapMarker);
            });
          }
        }
      });
    }

    return () => {
      // Cleanup dodatkowych markerów
      if (map && markers.length > 0) {
        markers.forEach(markerData => {
          if (markerData._mapMarker) {
            markerData._mapMarker.setMap(null);
            delete markerData._mapMarker;
          }
        });
      }
    };
  }, [map, markers, mapLoaded]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box 
        ref={mapRef} 
        sx={{ width: '100%', height: '100%', minHeight: '300px' }}
      />
      {interactive && (
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ position: 'absolute', bottom: 5, left: 5, bgcolor: 'rgba(255,255,255,0.7)', px: 1 }}
        >
          Kliknij na mapie lub przeciągnij marker, aby wybrać lokalizację
        </Typography>
      )}
    </Box>
  );
};

MapContainer.propTypes = {
  location: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }).isRequired,
  onLocationSelect: PropTypes.func,
  interactive: PropTypes.bool,
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      longitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      title: PropTypes.string,
      info: PropTypes.string,
      icon: PropTypes.string
    })
  )
};

export default MapContainer;
