import React, { useState, useEffect, Suspense } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner
} from '@chakra-ui/react';
import TimocomApiSettings from './TimocomApiSettings';
import LogisticsBaseSettings from './LogisticsBaseSettings';

// Komponent do obsługi błędów w podkomponentach
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught error in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px">
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Wystąpił błąd w komponencie
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {this.state.error?.message || "Nieznany błąd. Spróbuj odświeżyć stronę."}
          </AlertDescription>
        </Alert>
      );
    }
    return this.props.children;
  }
}

// Komponent opakowania dla podkomponentów z obsługą ładowania
const SafeComponent = ({ children }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Box textAlign="center" py={10}><Spinner size="xl" /></Box>}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

const Settings = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Upewnij się, że komponent jest montowany tylko po stronie klienta
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  if (!isLoaded) {
    return (
      <Container maxW="container.xl" py={5}>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4}>Ładowanie ustawień...</Text>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={5}>
      <Box mb={5}>
        <Heading size="lg">Ustawienia</Heading>
        <Text color="gray.600" mt={1}>
          Zarządzaj konfiguracją systemu i integracjami zewnętrznymi
        </Text>
      </Box>
      
      <Divider mb={6} />
      
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Ogólne</Tab>
          <Tab>Bazy logistyczne</Tab>
          <Tab>Integracje</Tab>
          <Tab>Użytkownicy</Tab>
          <Tab>Powiadomienia</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Box bg={bgColor} p={5} borderRadius="md" boxShadow="sm">
              <Heading size="md" mb={4}>Ustawienia ogólne</Heading>
              <Text>Ta sekcja jest w trakcie implementacji...</Text>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <SafeComponent>
              <LogisticsBaseSettings />
            </SafeComponent>
          </TabPanel>
          
          <TabPanel>
            <SafeComponent>
              <TimocomApiSettings />
            </SafeComponent>
          </TabPanel>
          
          <TabPanel>
            <Box bg={bgColor} p={5} borderRadius="md" boxShadow="sm">
              <Heading size="md" mb={4}>Zarządzanie użytkownikami</Heading>
              <Text>Ta sekcja jest w trakcie implementacji...</Text>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box bg={bgColor} p={5} borderRadius="md" boxShadow="sm">
              <Heading size="md" mb={4}>Konfiguracja powiadomień</Heading>
              <Text>Ta sekcja jest w trakcie implementacji...</Text>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default Settings;
