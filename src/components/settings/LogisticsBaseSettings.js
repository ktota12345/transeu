import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tooltip,
  Spinner,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiMapPin, FiMap } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchLogisticsBases, 
  addLogisticsBase, 
  updateLogisticsBase, 
  deleteLogisticsBase,
  selectAllLogisticsBases,
  selectLogisticsBasesStatus,
  selectLogisticsBasesError
} from '../../features/company/logisticsBasesSlice';
import GoogleMapPicker from './GoogleMapPicker';

const LogisticsBaseSettings = () => {
  const [currentBase, setCurrentBase] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: { full: '', city: '', postalCode: '', country: '' },
    coordinates: { lat: '', lng: '' }
  });
  const [activeTab, setActiveTab] = useState(0);
  
  const dispatch = useDispatch();
  const bases = useSelector(selectAllLogisticsBases);
  const status = useSelector(selectLogisticsBasesStatus);
  const error = useSelector(selectLogisticsBasesError);
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Pobieranie baz logistycznych przy pierwszym renderowaniu
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchLogisticsBases());
    }
  }, [status, dispatch]);
  
  // Obsługa formularza
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lat' || name === 'lng') {
      setFormData({
        ...formData,
        coordinates: {
          ...formData.coordinates,
          [name]: value
        }
      });
    } else if (name.includes('.')) {
      const [field, subField] = name.split('.');
      setFormData({
        ...formData,
        [field]: {
          ...formData[field],
          [subField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Obsługa wyboru lokalizacji z mapy
  const handleMapPositionSelected = (locationData) => {
    setFormData({
      ...formData,
      address: locationData.address,
      coordinates: {
        lat: locationData.coordinates.lat.toString(),
        lng: locationData.coordinates.lng.toString()
      }
    });
  };
  
  // Dodawanie nowej bazy
  const handleAddBase = () => {
    setCurrentBase(null);
    setFormData({
      name: '',
      address: { full: '', city: '', postalCode: '', country: '' },
      coordinates: { lat: '', lng: '' }
    });
    setActiveTab(0);
    onOpen();
  };
  
  // Edycja istniejącej bazy
  const handleEditBase = (base) => {
    setCurrentBase(base);
    setFormData({
      name: base.name,
      address: typeof base.address === 'object' && base.address !== null 
                ? base.address 
                : { full: base.address || '', city: '', postalCode: '', country: '' },
      coordinates: { 
        lat: base.coordinates.lat.toString(), 
        lng: base.coordinates.lng.toString() 
      }
    });
    setActiveTab(0);
    onOpen();
  };
  
  // Usuwanie bazy
  const handleDeleteBase = (id) => {
    dispatch(deleteLogisticsBase(id))
      .unwrap()
      .then(() => {
        toast({
          title: 'Baza usunięta',
          description: 'Baza logistyczna została pomyślnie usunięta',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        toast({
          title: 'Błąd',
          description: 'Nie udało się usunąć bazy logistycznej',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      });
  };
  
  // Zapisywanie bazy (dodawanie lub aktualizacja)
  const handleSaveBase = () => {
    // Walidacja
    if (!formData.name || 
        !formData.address || 
        !formData.address.full || 
        !formData.coordinates.lat || 
        !formData.coordinates.lng) {
      toast({
        title: 'Błąd walidacji',
        description: 'Nazwa bazy, pełny adres i współrzędne są wymagane',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Konwersja współrzędnych na liczby
    const coordinates = {
      lat: parseFloat(formData.coordinates.lat),
      lng: parseFloat(formData.coordinates.lng)
    };
    
    // Walidacja współrzędnych
    if (isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
      toast({
        title: 'Błąd walidacji',
        description: 'Współrzędne muszą być liczbami',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const baseData = {
      name: formData.name,
      address: formData.address,
      coordinates
    };
    
    if (currentBase) {
      // Aktualizacja istniejącej bazy
      dispatch(updateLogisticsBase({ ...baseData, id: currentBase.id }))
        .unwrap()
        .then(() => {
          toast({
            title: 'Baza zaktualizowana',
            description: 'Baza logistyczna została pomyślnie zaktualizowana',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          onClose();
        })
        .catch((err) => {
          toast({
            title: 'Błąd',
            description: 'Nie udało się zaktualizować bazy logistycznej',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        });
    } else {
      // Dodanie nowej bazy
      dispatch(addLogisticsBase(baseData))
        .unwrap()
        .then(() => {
          toast({
            title: 'Baza dodana',
            description: 'Nowa baza logistyczna została pomyślnie dodana',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          onClose();
        })
        .catch((err) => {
          toast({
            title: 'Błąd',
            description: 'Nie udało się dodać nowej bazy logistycznej',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        });
    }
  };
  
  // Renderowanie zawartości w zależności od statusu
  let content;
  
  if (status === 'loading') {
    content = (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Ładowanie baz logistycznych...</Text>
      </Box>
    );
  } else if (status === 'failed') {
    content = (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Text>Wystąpił błąd podczas ładowania baz logistycznych: {error}</Text>
      </Alert>
    );
  } else if (!Array.isArray(bases)) {
    content = (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Text>Błąd: Otrzymane dane baz logistycznych nie są tablicą. Spróbuj odświeżyć stronę.</Text>
      </Alert>
    );
  } else if (bases.length === 0) {
    content = (
      <Box 
        p={10} 
        textAlign="center" 
        borderWidth="1px" 
        borderRadius="md" 
        borderStyle="dashed"
        borderColor={borderColor}
      >
        <FiMapPin size={40} style={{ margin: '0 auto 16px' }} />
        <Heading size="sm" mb={2}>Brak zdefiniowanych baz logistycznych</Heading>
        <Text mb={4}>Dodaj swoją pierwszą bazę logistyczną, aby umożliwić agentom efektywne planowanie tras.</Text>
        <Button 
          leftIcon={<FiPlus />} 
          colorScheme="blue" 
          onClick={handleAddBase}
        >
          Dodaj bazę
        </Button>
      </Box>
    );
  } else {
    content = (
      <Box overflowX="auto">
        <Table variant="simple" size="md">
          <Thead>
            <Tr>
              <Th>Nazwa</Th>
              <Th>Adres</Th>
              <Th>Współrzędne</Th>
              <Th width="100px">Akcje</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Array.isArray(bases) && bases.map((base) => (
              <Tr key={base.id}>
                <Td fontWeight="medium">{base.name}</Td>
                <Td>{base.address.full}</Td>
                <Td>{base.coordinates.lat.toFixed(6)}, {base.coordinates.lng.toFixed(6)}</Td>
                <Td>
                  <HStack spacing={2}>
                    <Tooltip label="Edytuj bazę">
                      <IconButton
                        aria-label="Edytuj bazę"
                        icon={<FiEdit />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleEditBase(base)}
                      />
                    </Tooltip>
                    <Tooltip label="Usuń bazę">
                      <IconButton
                        aria-label="Usuń bazę"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDeleteBase(base.id)}
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  }
  
  return (
    <Box bg={bgColor} p={5} borderRadius="md" boxShadow="sm">
      <HStack justifyContent="space-between" mb={4}>
        <Heading size="md">Bazy logistyczne</Heading>
        <Button 
          leftIcon={<FiPlus />} 
          colorScheme="blue" 
          onClick={handleAddBase}
          isDisabled={status === 'loading'}
        >
          Dodaj bazę
        </Button>
      </HStack>
      
      <Text mb={4}>
        Zarządzaj lokalizacjami baz logistycznych, które będą używane przez agentów do planowania tras i optymalizacji zleceń.
      </Text>
      
      {content}
      
      {/* Modal do dodawania/edycji bazy */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {currentBase ? 'Edytuj bazę logistyczną' : 'Dodaj nową bazę logistyczną'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" colorScheme="blue" mb={4}>
              <TabList>
                <Tab>Dane podstawowe</Tab>
                <Tab>Wybierz na mapie {formData.address.full && <Badge ml={2} colorScheme="green" variant="solid" borderRadius="full" size="sm">✓</Badge>}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Nazwa bazy</FormLabel>
                      <Input 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="np. Baza Warszawa"
                      />
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Adres</FormLabel>
                      <InputGroup>
                        <Input 
                          name="address.full"
                          value={formData.address.full}
                          onChange={handleInputChange}
                          placeholder="Wybierz na mapie lub wpisz ręcznie"
                          isReadOnly
                        />
                      </InputGroup>
                    </FormControl>
                    
                    <HStack width="100%" spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Szerokość geograficzna</FormLabel>
                        <Input 
                          name="lat"
                          value={formData.coordinates.lat}
                          onChange={handleInputChange}
                          placeholder="np. 52.229676"
                          type="number"
                          step="0.000001"
                        />
                      </FormControl>
                      
                      <FormControl isRequired>
                        <FormLabel>Długość geograficzna</FormLabel>
                        <Input 
                          name="lng"
                          value={formData.coordinates.lng}
                          onChange={handleInputChange}
                          placeholder="np. 21.012229"
                          type="number"
                          step="0.000001"
                        />
                      </FormControl>
                    </HStack>
                    
                    <Button 
                      leftIcon={<FiMap />} 
                      variant="outline" 
                      width="100%" 
                      onClick={() => setActiveTab(1)}
                    >
                      Wybierz lokalizację na mapie
                    </Button>
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <GoogleMapPicker 
                    initialPosition={
                      formData.coordinates.lat && formData.coordinates.lng
                        ? {
                            lat: parseFloat(formData.coordinates.lat),
                            lng: parseFloat(formData.coordinates.lng)
                          }
                        : null
                    }
                    onPositionSelected={handleMapPositionSelected}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Anuluj
            </Button>
            <Button colorScheme="blue" onClick={handleSaveBase}>
              Zapisz
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LogisticsBaseSettings;
