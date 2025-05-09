import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import pl from 'date-fns/locale/pl';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './TruckCalendar.css';
import { 
  Box, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalCloseButton, 
  ModalBody, 
  Text, 
  VStack,
  useDisclosure,
  ModalFooter,
  Button
} from '@chakra-ui/react';

// Ustawienia lokalizatora dla date-fns
const locales = {
  'pl': pl,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Poniedziałek jako początek tygodnia
  getDay,
  locales,
});

// Formaty daty i czasu dla kalendarza
const formats = {
  timeGutterFormat: (date, culture, localizer) => 
    localizer.format(date, 'HH:mm', culture),
  dayFormat: (date, culture, localizer) => 
    localizer.format(date, 'eeee dd.MM', culture), // Dzień tygodnia i data
  agendaHeaderFormat: ({ start, end }, culture, localizer) =>
    localizer.format(start, 'eeee dd.MM', culture) + ' — ' + localizer.format(end, 'eeee dd.MM', culture),
  selectRangeFormat: ({ start, end }, culture, localizer) =>
    localizer.format(start, 'HH:mm', culture) + ' – ' + localizer.format(end, 'HH:mm', culture),
  eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
    localizer.format(start, 'HH:mm', culture) + ' – ' + localizer.format(end, 'HH:mm', culture),
};

// Funkcja pomocnicza do tworzenia dat (pozostaje bez zmian, ale może być przeniesiona)
const createDate = (dayOffset, hour, minute) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
};

// Komponent TruckCalendar przyjmuje teraz `events` i `selectedVehicleId` jako props
const TruckCalendar = ({ events, selectedVehicleId }) => {
  const [filteredEvents, setFilteredEvents] = useState([]); // Stan dla przefiltrowanych wydarzeń
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Efekt do filtrowania wydarzeń przy zmianie selectedVehicleId LUB przekazanych events
  useEffect(() => {
    if (events && selectedVehicleId) {
      setFilteredEvents(events.filter(event => event.resource === selectedVehicleId));
    } else {
      setFilteredEvents([]); // Wyczyść, jeśli brakuje danych
    }
  }, [selectedVehicleId, events]); // Zależność od events i selectedVehicleId

  // Obsługa kliknięcia w wydarzenie (bez zmian)
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    onOpen();
  };

  // Niestandardowy komponent wydarzenia (bez zmian)
  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: '#3182ce', 
      borderRadius: '5px',
      color: 'white',
      border: '2px solid #2c5282', 
      display: 'block',
      fontSize: '0.85em', 
      padding: '2px 5px',
      whiteSpace: 'normal', 
      overflow: 'hidden'
    };
    return {
      style
    };
  };

  // Logowanie przed renderowaniem (można usunąć lub zostawić dla diagnostyki)
  // console.log('Rendering Calendar with filteredEvents:', filteredEvents);
  // filteredEvents.forEach((event, index) => {
  //   if (!event || typeof event.title === 'undefined') {
  //     console.error(`Event at index ${index} is invalid (missing title?):`, event);
  //   }
  // });

  return (
    <Box className="truck-calendar-container"> 
      <Calendar
        localizer={localizer}
        events={filteredEvents} // Używamy przefiltrowanych wydarzeń
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={['week', 'day']}
        defaultView="week"
        formats={formats}
        onSelectEvent={handleEventClick}
        eventPropGetter={eventStyleGetter}
        slotMinTime={new Date(0, 0, 0, 5, 0, 0)} 
        slotMaxTime={new Date(0, 0, 0, 20, 0, 0)}
        min={new Date(0, 0, 0, 5, 0, 0)} 
        max={new Date(0, 0, 0, 20, 0, 0)}
        step={60}
        timeslots={1}
        dayLayoutAlgorithm="no-overlap" 
        showMultiDayTimes={true} 
        messages={{
          week: 'Tydzień',
          day: 'Dzień',
          today: 'Dziś',
          previous: 'Poprzedni',
          next: 'Następny',
          noEventsInRange: 'Brak wydarzeń w tym zakresie.', // Dodano komunikat
        }}
      />

      {/* Modal ze szczegółami wydarzenia (bez zmian) */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          {selectedEvent && (
            <>
              <ModalHeader>{selectedEvent.title}</ModalHeader> 
              <ModalCloseButton />
              <ModalBody> 
                <VStack align="start" spacing={1}> 
                  <Text> 
                    <strong>Nr zlecenia:</strong> {selectedEvent.orderDetails?.orderNumber || 'Brak'}
                  </Text>
                  <Text>
                    <strong>Pojazd:</strong> {selectedEvent.resource}
                  </Text>
                  <Text>
                    <strong>Kierowca:</strong> {selectedEvent.orderDetails?.driver || 'Brak'}
                  </Text>
                  <Text>
                    <strong>Ładunek:</strong> {selectedEvent.orderDetails?.cargo || 'Brak'}
                  </Text>
                  <Text>
                    <strong>Miejsce załadunku:</strong> {selectedEvent.orderDetails?.loadLocation || 'Brak'}
                  </Text>
                  <Text>
                    <strong>Miejsce rozładunku:</strong> {selectedEvent.orderDetails?.unloadLocation || 'Brak'}
                  </Text>
                   <Text>
                    <strong>Start:</strong> {selectedEvent.start ? format(selectedEvent.start, 'eeee, dd.MM.yyyy HH:mm', { locale: pl }) : 'Brak'}
                  </Text>
                  <Text>
                    <strong>Koniec:</strong> {selectedEvent.end ? format(selectedEvent.end, 'eeee, dd.MM.yyyy HH:mm', { locale: pl }) : 'Brak'}
                  </Text>
                  <Text>
                    <strong>Dodatkowe informacje:</strong> {selectedEvent.orderDetails?.additionalInfo || 'Brak'}
                  </Text>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme='blue' mr={3} onClick={onClose}>
                  Zamknij
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TruckCalendar;
