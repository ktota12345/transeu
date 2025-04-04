import React from 'react';
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
  useColorModeValue
} from '@chakra-ui/react';
import TimocomApiSettings from './TimocomApiSettings';
import LogisticsBaseSettings from './LogisticsBaseSettings';

const Settings = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  
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
            <LogisticsBaseSettings />
          </TabPanel>
          
          <TabPanel>
            <TimocomApiSettings />
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
