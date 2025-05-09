import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Switch,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Divider,
  InputGroup,
  InputRightElement,
  IconButton,
  Spinner
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, CheckIcon } from '@chakra-ui/icons';
import { fetchTimocomSettings, saveTimocomSettings, testTimocomConnection } from '../../api/settingsApi';

// Klucze do przechowywania danych w localStorage (używane jako backup)
const LOCAL_STORAGE_KEYS = {
  username: 'timocom_username',
  password: 'timocom_password',
  enabled: 'timocom_enabled'
};

const TimocomApiSettings = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    enabled: false
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [isPasswordSetInDb, setIsPasswordSetInDb] = useState(false); // Nowy stan
  const toast = useToast();

  // Wczytaj zapisane dane przy inicjalizacji komponentu
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      setIsPasswordSetInDb(false); // Resetuj stan na początku
      try {
        // Próba pobrania ustawień z bazy danych
        const dbSettings = await fetchTimocomSettings();
        
        if (dbSettings) { // Sprawdź, czy dane zostały pobrane
          setCredentials({
            username: dbSettings.username || '',
            password: '', // Puste dla bezpieczeństwa
            enabled: dbSettings.enabled || false
          });
          // Ustaw wskaźnik, jeśli hasło istnieje w bazie
          if (dbSettings.password && dbSettings.password.length > 0) {
            setIsPasswordSetInDb(true);
          }
          
          // Zapisz kopię w localStorage dla kompatybilności z istniejącym kodem
          localStorage.setItem(LOCAL_STORAGE_KEYS.username, dbSettings.username || '');
          localStorage.setItem(LOCAL_STORAGE_KEYS.enabled, (dbSettings.enabled || false).toString());
          // Nie zapisujemy hasła w localStorage
          
          toast({
            title: 'Wczytano ustawienia',
            description: 'Dane uwierzytelniające do API TIMOCOM zostały wczytane z bazy danych.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          // Jeśli fetchTimocomSettings zwróci null (błąd), użyj localStorage
          throw new Error("Failed to fetch settings from DB");
        }

      } catch (error) {
        console.error('Error loading TIMOCOM settings from database or DB fetch failed:', error);
        
        // Fallback do localStorage
        const savedUsername = localStorage.getItem(LOCAL_STORAGE_KEYS.username);
        const savedEnabled = localStorage.getItem(LOCAL_STORAGE_KEYS.enabled) === 'true';
        // Sprawdź, czy hasło jest w localStorage (chociaż nie powinno być)
        const savedPasswordLs = localStorage.getItem(LOCAL_STORAGE_KEYS.password);
        
        setCredentials({
          username: savedUsername || '',
          password: '', // Puste dla bezpieczeństwa
          enabled: savedEnabled
        });
        // Spróbuj ustawić wskaźnik na podstawie obecności hasła w localStorage
        if (savedPasswordLs && savedPasswordLs.length > 0) {
          setIsPasswordSetInDb(true);
        }
        
        toast({
          title: 'Błąd wczytywania ustawień',
          description: 'Nie udało się wczytać danych z bazy. Używam danych lokalnych (jeśli istnieją).',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [toast]);

  // Obsługa zmian w formularzu
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: name === 'enabled' ? checked : value
    }));
  };

  // Przełącznik widoczności hasła
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Zapisz dane uwierzytelniające
  const saveCredentials = async () => {
    setIsSaving(true);
    try {
      // Przygotuj dane do zapisania w bazie danych
      const settingsToSave = {
        username: credentials.username,
        enabled: credentials.enabled,
        lastUpdated: new Date().toISOString()
      };
      
      // Dodaj hasło tylko jeśli zostało wprowadzone
      if (credentials.password) {
        settingsToSave.password = credentials.password;
      }
      
      // Zapisz dane w bazie danych
      await saveTimocomSettings(settingsToSave);
      
      // Zapisz kopię w localStorage dla kompatybilności z istniejącym kodem
      localStorage.setItem(LOCAL_STORAGE_KEYS.username, credentials.username);
      if (credentials.password) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.password, credentials.password);
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.enabled, credentials.enabled.toString());
      
      toast({
        title: 'Zapisano ustawienia',
        description: 'Dane uwierzytelniające do API TIMOCOM zostały zapisane w bazie danych.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Błąd podczas zapisywania',
        description: 'Nie udało się zapisać danych uwierzytelniających w bazie danych.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Error saving TIMOCOM credentials:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Testowanie połączenia z API
  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    let credentialsForTest = { ...credentials };

    try {
      // Jeśli pole hasła jest puste, ale wiemy, że jest zapisane w bazie,
      // pobierz je przed testem.
      if (!credentials.password && isPasswordSetInDb) {
        console.log("Password field is empty, but DB password exists. Fetching saved settings...");
        const savedSettings = await fetchTimocomSettings();
        if (savedSettings && savedSettings.password) {
          credentialsForTest.password = savedSettings.password;
        } else {
          // Jeśli nie udało się pobrać zapisanego hasła, pokaż błąd
          throw new Error("Nie można pobrać zapisanego hasła do testu. Wprowadź hasło ręcznie.");
        }
      }

      // Jeśli pole hasła jest puste i nie ma nic w bazie, rzuć błąd
      if (!credentialsForTest.password) {
        throw new Error("Hasło jest wymagane do przeprowadzenia testu.");
      }

      // Testuj połączenie używając przygotowanych danych
      const result = await testTimocomConnection(credentialsForTest);
      
      setTestResult(result); // Zapisz wynik testu (obiekt { success, message })
      
      toast({
        title: result.success ? 'Test zakończony powodzeniem' : 'Test zakończony niepowodzeniem',
        description: result.message,
        status: result.success ? 'success' : 'error',
        duration: 5000,
        isClosable: true,
      });

    } catch (error) {
      const errorMessage = error.message || "Nieznany błąd podczas testowania połączenia.";
      setTestResult({
        success: false,
        message: `Błąd: ${errorMessage}`
      });
      
      toast({
        title: 'Błąd testowania połączenia',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error("Error during testConnection:", error);
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Heading size="md">Ustawienia API TIMOCOM</Heading>
        </CardHeader>
        <CardBody>
          <Box display="flex" justifyContent="center" alignItems="center" py={10}>
            <Spinner size="xl" />
            <Text ml={4}>Wczytywanie ustawień...</Text>
          </Box>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Heading size="md">Ustawienia API TIMOCOM</Heading>
        <Text mt={2} color="gray.600">
          Skonfiguruj dane dostępowe do giełdy transportowej TIMOCOM
        </Text>
      </CardHeader>
      <Divider />
      <CardBody>
        <VStack spacing={4} align="stretch">
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="enabled" mb="0">
              Włącz integrację z TIMOCOM
            </FormLabel>
            <Switch 
              id="enabled" 
              name="enabled" 
              isChecked={credentials.enabled} 
              onChange={handleChange} 
              colorScheme="blue"
            />
          </FormControl>
          
          <FormControl id="username" isRequired>
            <FormLabel>Nazwa użytkownika</FormLabel>
            <Input
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Wprowadź nazwę użytkownika"
            />
          </FormControl>
          
          <FormControl id="password" isRequired>
            <FormLabel>Hasło</FormLabel>
            <InputGroup>
              <Input
                name="password"
                type={isPasswordVisible ? 'text' : 'password'}
                value={credentials.password}
                onChange={handleChange}
                placeholder="Wprowadź hasło"
              />
              <InputRightElement>
                <IconButton
                  aria-label={isPasswordVisible ? 'Ukryj hasło' : 'Pokaż hasło'}
                  icon={isPasswordVisible ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={togglePasswordVisibility}
                  variant="ghost"
                  size="sm"
                />
              </InputRightElement>
            </InputGroup>
            {/* Wskaźnik, że hasło jest zapisane w bazie */} 
            {!credentials.password && isPasswordSetInDb && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                (hasło zapisane w bazie)
              </Text>
            )}
          </FormControl>
          
          <HStack spacing={4} pt={2}>
            <Button 
              colorScheme="blue" 
              leftIcon={<CheckIcon />} 
              onClick={saveCredentials}
              isLoading={isSaving}
              loadingText="Zapisywanie..."
            >
              Zapisz ustawienia
            </Button>
            <Button 
              variant="outline" 
              onClick={testConnection}
              isLoading={isTesting}
              loadingText="Testowanie..."
              isDisabled={!credentials.username || !credentials.password}
            >
              Testuj połączenie
            </Button>
          </HStack>
          
          {testResult && (
            <Box 
              p={3} 
              bg={testResult.success ? 'green.100' : 'red.100'} 
              color={testResult.success ? 'green.800' : 'red.800'}
              borderRadius="md"
              mt={2}
            >
              {testResult.message}
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default TimocomApiSettings;
