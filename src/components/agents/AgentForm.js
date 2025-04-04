import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createAgent, updateAgent, fetchAgent, clearCurrentAgent } from '../../features/agents/agentsSlice';
import { selectAllLogisticsBases, fetchLogisticsBases } from '../../features/company/logisticsBasesSlice';
import {
    Box,
    Button,
    VStack,
    HStack,
    Text,
    ButtonGroup,
    Input,
    Textarea,
    SimpleGrid,
    Tag,
    TagLabel,
    TagCloseButton,
    Card,
    CardBody,
    CardHeader,
    Heading,
    Flex,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useColorModeValue,
    FormControl, 
    FormLabel, 
    Select, 
    Switch, 
    NumberInput, 
    NumberInputField, 
    NumberInputStepper, 
    NumberIncrementStepper, 
    NumberDecrementStepper, 
    useToast,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    SliderMark,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react';
import { FiArrowLeft, FiSave, FiSliders } from 'react-icons/fi';

const checkFrequencyOptions = [
    { value: 'live', label: 'Na żywo (ciągłe monitorowanie)' },
    { value: 'hourly', label: 'Co godzinę' },
    { value: '30min', label: 'Co 30 minut' },
    { value: '15min', label: 'Co 15 minut' },
    { value: 'custom', label: 'Niestandardowa' }
];

const operatorsList = [
    { value: 'op1', label: 'Jan Kowalski' },
    { value: 'op2', label: 'Anna Nowak' },
    { value: 'op3', label: 'Piotr Wiśniewski' }
];

const specializationOptions = [
    'przewozy standardowe',
    'chłodnicze',
    'ADR',
    'ponadgabarytowe'
];

const daysOfWeek = [
    { value: 'mon', label: 'Poniedziałek' },
    { value: 'tue', label: 'Wtorek' },
    { value: 'wed', label: 'Środa' },
    { value: 'thu', label: 'Czwartek' },
    { value: 'fri', label: 'Piątek' },
    { value: 'sat', label: 'Sobota' },
    { value: 'sun', label: 'Niedziela' }
];

const cargoTypes = [
    'Palety', 'Kartony', 'Materiały sypkie', 'Płyny', 'Materiały niebezpieczne', 'Żywność'
];

const additionalServices = [
    'Obsługa celna', 'Magazynowanie', 'Konsolidacja ładunków', 'Przepakowanie', 'Etykietowanie'
];

const countriesList = [
    'Polska', 'Niemcy', 'Francja', 'Włochy', 'Hiszpania', 'Holandia', 'Belgia', 'Czechy', 'Słowacja', 'Austria'
];

const roadPreferences = [
    'Autostrady', 'Drogi ekspresowe', 'Drogi krajowe', 'Inne'
];

const paymentTerms = [
    '7 dni', '14 dni', '30 dni', '45 dni', '60 dni'
];

const currencies = [
    'PLN', 'EUR', 'USD', 'GBP'
];

const trailerTypes = [
    'Plandeka', 'Chłodnia', 'Platforma', 'Silos', 'Cysterna'
];

const specialEquipment = [
    'Winda', 'Wózek widłowy', 'GPS', 'System monitoringu temperatury'
];

const certificates = [
    'ADR', 'ATP', 'HACCP', 'ISO', 'GDP'
];

const negotiationStrategies = [
    { value: 'Kompromis', label: 'Kompromis' },
    { value: 'Współpraca', label: 'Współpraca' },
    { value: 'Rywalizacja', label: 'Rywalizacja' }
];

const negotiationStages = [
    'Początkowa oferta', 'Kontrpropozycja', 'Ustalanie warunków dodatkowych', 'Finalizacja'
];

const workIntensityOptions = [
    { value: 'accuracy', label: 'Priorytetyzuj dokładność' },
    { value: 'speed', label: 'Priorytetyzuj szybkość' },
    { value: 'balanced', label: 'Tryb zrównoważony' }
];

export const AgentForm = ({ initialData, onSubmit, onTest, onDuplicate, onDelete }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();
    const { currentAgent, status } = useSelector(state => state.agents);
    const logisticsBases = useSelector(selectAllLogisticsBases);
    const toast = useToast();
    const isSubmitting = status === 'loading';
    const isEditing = !!id;

    // Pobierz dane i zainicjuj formularz
    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            // 1. Informacje podstawowe
            name: '',
            description: '',
            isActive: false,
            priority: 1,
            operator: '',
            tags: [],
            
            // 2. Kontekst biznesowy
            specialization: [],
            priorityClients: [],
            preferredCargoTypes: [],
            unwantedCargoTypes: [],
            additionalServices: [],
            
            // 3. Parametry geograficzne
            preferredRoutes: [],
            regionsToAvoid: [],
            vehicleBases: [],
            selectedLogisticsBase: null,
            customLogisticsPoint: null,
            maxOperatingRadius: 500,
            preferredCountries: [],
            unwantedCountries: [],
            roadPreferences: [],
            
            // 4. Parametry finansowe
            minRatePerKm: 1.0,
            targetRatePerKm: 1.5,
            minOrderValue: 500,
            preferredPaymentTerms: [],
            currencies: ['PLN', 'EUR'],
            additionalFees: [],
            emptyKmCost: 0.8,
            minProfitMargin: 10,
            
            // 5. Integracja z TMS
            availabilityQueryParams: {},
            minAvailabilityBuffer: 1,
            preferredDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
            preferredHours: {
                start: '08:00',
                end: '18:00'
            },
            maxExecutionTime: 48,
            timeBuffer: 2,
            availabilityUpdateFrequency: 'hourly',
            checkPriority: 'beforeAnalysis',
            
            // 6. Wymagania techniczne
            trailerTypes: [],
            liftCapacityRange: {
                min: 0,
                max: 24
            },
            specialEquipment: [],
            certificates: [],
            cargoParameters: {
                width: 0,
                height: 0,
                length: 0
            },
            specialRequirements: '',
            
            // 7. Ustawienia negocjacji
            negotiationAggressiveness: 3,
            maxCounterOffers: 3,
            minResponseTime: 1,
            maxResponseTime: 15,
            negotiationStrategiesSelected: [],
            negotiationInstructions: '',
            
            // 8. Warunki przełączenia na operatora
            priceThreshold: 15,
            unusualClientRequirements: [],
            keywordTriggers: [],
            emotionDetectionLevel: 50, // 0-100 scale
            negotiationStagesRequiringHuman: [],
            maxClientIdleTime: 15, // Maksymalny czas bez odpowiedzi klienta
            
            // 9. Harmonogram pracy agenta
            checkFrequency: 'hourly',
            customCheckInterval: 60,
            workingHours: {
                start: '09:00',
                end: '17:00'
            },
            workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
            scheduleExceptions: [],
            workIntensity: 'balanced',
            maxConcurrentNegotiations: 1,
            
            isDraft: true
        }
    });

    const checkFrequency = watch('checkFrequency');
    const tags = watch('tags') || [];
    const specialization = watch('specialization') || [];
    const priorityClients = watch('priorityClients') || [];
    const preferredCargoTypes = watch('preferredCargoTypes') || [];
    const unwantedCargoTypes = watch('unwantedCargoTypes') || [];
    const additionalServicesSelected = watch('additionalServices') || [];
    const preferredCountries = watch('preferredCountries') || [];
    const unwantedCountries = watch('unwantedCountries') || [];
    const roadPreferencesSelected = watch('roadPreferences') || [];
    const preferredPaymentTerms = watch('preferredPaymentTerms') || [];
    const currenciesSelected = watch('currencies') || [];
    const trailerTypesSelected = watch('trailerTypes') || [];
    const specialEquipmentSelected = watch('specialEquipment') || [];
    const certificatesSelected = watch('certificates') || [];
    const negotiationStrategiesSelected = watch('negotiationStrategiesSelected') || [];
    const unusualClientRequirements = watch('unusualClientRequirements') || [];
    const keywordTriggers = watch('keywordTriggers') || [];
    const negotiationStagesRequiringHuman = watch('negotiationStagesRequiringHuman') || [];
    const scheduleExceptions = watch('scheduleExceptions') || [];

    const handleFormSubmit = (data) => {
        try {
            onSubmit(data);
            toast({
                title: 'Sukces',
                description: 'Profil został zapisany',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Błąd',
                description: 'Nie udało się zapisać profilu',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleAddTag = (tag) => {
        if (tag && !tags.includes(tag)) {
            setValue('tags', [...tags, tag]);
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setValue('tags', tags.filter(tag => tag !== tagToRemove));
    };

    const handleToggleSpecialization = (spec) => {
        if (specialization.includes(spec)) {
            setValue('specialization', specialization.filter(s => s !== spec));
        } else {
            setValue('specialization', [...specialization, spec]);
        }
    };

    const handleAddPriorityClient = (client) => {
        if (client && !priorityClients.includes(client)) {
            setValue('priorityClients', [...priorityClients, client]);
        }
    };

    const handleRemovePriorityClient = (client) => {
        setValue('priorityClients', priorityClients.filter(c => c !== client));
    };

    const handleToggleCargoType = (type, field) => {
        const currentValues = watch(field) || [];
        if (currentValues.includes(type)) {
            setValue(field, currentValues.filter(t => t !== type));
        } else {
            setValue(field, [...currentValues, type]);
        }
    };

    const handleToggleAdditionalService = (service) => {
        if (additionalServicesSelected.includes(service)) {
            setValue('additionalServices', additionalServicesSelected.filter(s => s !== service));
        } else {
            setValue('additionalServices', [...additionalServicesSelected, service]);
        }
    };

    const handleToggleCountry = (country, field) => {
        const currentValues = watch(field) || [];
        if (currentValues.includes(country)) {
            setValue(field, currentValues.filter(c => c !== country));
        } else {
            setValue(field, [...currentValues, country]);
        }
    };

    const handleToggleRoadPreference = (preference) => {
        if (roadPreferencesSelected.includes(preference)) {
            setValue('roadPreferences', roadPreferencesSelected.filter(p => p !== preference));
        } else {
            setValue('roadPreferences', [...roadPreferencesSelected, preference]);
        }
    };

    const handleTogglePaymentTerm = (term) => {
        if (preferredPaymentTerms.includes(term)) {
            setValue('preferredPaymentTerms', preferredPaymentTerms.filter(t => t !== term));
        } else {
            setValue('preferredPaymentTerms', [...preferredPaymentTerms, term]);
        }
    };

    const handleToggleCurrency = (currency) => {
        if (currenciesSelected.includes(currency)) {
            setValue('currencies', currenciesSelected.filter(c => c !== currency));
        } else {
            setValue('currencies', [...currenciesSelected, currency]);
        }
    };

    const handleAddAdditionalFee = (feeType, feeAmount) => {
        if (feeType && feeAmount) {
            const additionalFees = watch('additionalFees') || [];
            setValue('additionalFees', [...additionalFees, { type: feeType, amount: feeAmount }]);
        }
    };

    const handleRemoveAdditionalFee = (index) => {
        const additionalFees = watch('additionalFees') || [];
        setValue('additionalFees', additionalFees.filter((_, i) => i !== index));
    };

    const handleToggleTrailerType = (type) => {
        if (trailerTypesSelected.includes(type)) {
            setValue('trailerTypes', trailerTypesSelected.filter(t => t !== type));
        } else {
            setValue('trailerTypes', [...trailerTypesSelected, type]);
        }
    };

    const handleToggleSpecialEquipment = (equipment) => {
        if (specialEquipmentSelected.includes(equipment)) {
            setValue('specialEquipment', specialEquipmentSelected.filter(e => e !== equipment));
        } else {
            setValue('specialEquipment', [...specialEquipmentSelected, equipment]);
        }
    };

    const handleToggleCertificate = (certificate) => {
        if (certificatesSelected.includes(certificate)) {
            setValue('certificates', certificatesSelected.filter(c => c !== certificate));
        } else {
            setValue('certificates', [...certificatesSelected, certificate]);
        }
    };

    const handleAddNegotiationArgument = (argument) => {
        if (argument && !negotiationStrategiesSelected.includes(argument)) {
            setValue('negotiationStrategiesSelected', [...negotiationStrategiesSelected, argument]);
        }
    };

    const handleRemoveNegotiationArgument = (argument) => {
        setValue('negotiationStrategiesSelected', negotiationStrategiesSelected.filter(a => a !== argument));
    };

    const handleAddUnusualClientRequirement = (requirement) => {
        if (requirement && !unusualClientRequirements.includes(requirement)) {
            setValue('unusualClientRequirements', [...unusualClientRequirements, requirement]);
        }
    };

    const handleRemoveUnusualClientRequirement = (requirement) => {
        setValue('unusualClientRequirements', unusualClientRequirements.filter(r => r !== requirement));
    };

    const handleAddKeywordTrigger = (keyword) => {
        if (keyword && !keywordTriggers.includes(keyword)) {
            setValue('keywordTriggers', [...keywordTriggers, keyword]);
        }
    };

    const handleRemoveKeywordTrigger = (keyword) => {
        setValue('keywordTriggers', keywordTriggers.filter(k => k !== keyword));
    };

    const handleToggleNegotiationStage = (stage) => {
        if (negotiationStagesRequiringHuman.includes(stage)) {
            setValue('negotiationStagesRequiringHuman', negotiationStagesRequiringHuman.filter(s => s !== stage));
        } else {
            setValue('negotiationStagesRequiringHuman', [...negotiationStagesRequiringHuman, stage]);
        }
    };

    const handleAddScheduleException = (date, isActive) => {
        if (date) {
            const formattedDate = new Date(date).toISOString().split('T')[0];
            const exceptions = watch('scheduleExceptions') || [];
            
            // Check if date already exists
            const existingIndex = exceptions.findIndex(e => e.date === formattedDate);
            
            if (existingIndex >= 0) {
                // Update existing exception
                const updatedExceptions = [...exceptions];
                updatedExceptions[existingIndex] = { date: formattedDate, isActive };
                setValue('scheduleExceptions', updatedExceptions);
            } else {
                // Add new exception
                setValue('scheduleExceptions', [...exceptions, { date: formattedDate, isActive }]);
            }
        }
    };

    const handleRemoveScheduleException = (date) => {
        const exceptions = watch('scheduleExceptions') || [];
        setValue('scheduleExceptions', exceptions.filter(e => e.date !== date));
    };

    const handleSelectLogisticsBase = (baseId) => {
        setValue('selectedLogisticsBase', baseId);
        setValue('customLogisticsPoint', null);
    };

    const handleSelectCustomPoint = () => {
        setValue('selectedLogisticsBase', null);
        if (!watch('customLogisticsPoint')) {
            setValue('customLogisticsPoint', { latitude: '', longitude: '', name: 'Punkt niestandardowy' });
        }
    };

    const handleCustomPointChange = (field, value) => {
        const currentPoint = watch('customLogisticsPoint') || { latitude: '', longitude: '', name: 'Punkt niestandardowy' };
        setValue('customLogisticsPoint', { ...currentPoint, [field]: value });
    };

    const onFormSubmit = (data) => {
        console.log("Data being submitted:", data); 
        if (isEditing) {
            console.log("Editing agent with data:", data); 
            dispatch(updateAgent({ id, agentData: data }))
                .unwrap()
                .then(() => {
                    toast({
                        title: 'Agent zaktualizowany',
                        description: 'Pomyślnie zaktualizowano dane agenta',
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    });
                    navigate('/agents');
                })
                .catch(error => {
                    toast({
                        title: 'Błąd',
                        description: `Nie udało się zaktualizować agenta: ${error.message}`,
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                });
        } else {
            console.log("Creating agent with data:", data); 
            dispatch(createAgent(data))
                .unwrap()
                .then(() => {
                    toast({
                        title: 'Agent utworzony',
                        description: 'Pomyślnie utworzono nowego agenta',
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    });
                    navigate('/agents');
                })
                .catch(error => {
                    toast({
                        title: 'Błąd',
                        description: `Nie udało się utworzyć agenta: ${error.message}`,
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                });
        }
    };

    // Efekt do pobierania danych agenta i baz logistycznych
    useEffect(() => {
        dispatch(fetchLogisticsBases());
        if (id) {
            dispatch(fetchAgent(id));
        } else {
            // Jeśli tworzymy nowego agenta, wartości domyślne z useForm
            // powinny wystarczyć. Nie resetujemy tutaj dodatkowo.
        }
        // Cleanup przy odmontowaniu komponentu
        return () => {
            dispatch(clearCurrentAgent());
        };
    }, [dispatch, id]); 

    // Efekt do resetowania formularza, gdy dane agenta (currentAgent) zostaną załadowane w trybie edycji
    useEffect(() => {
        if (isEditing && currentAgent) {
            console.log("Resetting form with currentAgent:", currentAgent); 
            // Upewnij się, że przekazujesz obiekt z polami pasującymi do formularza
            // Możesz potrzebować transformacji jeśli struktura się różni
            reset(currentAgent); 
        }
    }, [isEditing, currentAgent, reset]);

    return (
        <Box p={6} bg="gray.50">
            <form onSubmit={handleSubmit(onFormSubmit)}>
                <VStack spacing={6} align="stretch">
                    {/* Sekcja 1: Informacje podstawowe */}
                    <Box>
                        <Card shadow="md" bg={useColorModeValue('white', 'gray.700')}>
                            <CardHeader>
                                <Heading size="md" color="gray.700">1. Informacje podstawowe</Heading>
                            </CardHeader>
                            <CardBody>
                                <SimpleGrid columns={[1, null, 2]} spacing={6}>
                                    <FormControl isRequired>
                                        <FormLabel>Nazwa profilu</FormLabel>
                                        <Input {...register('name', { required: true })} />
                                        {errors.name && <Text color="red">To pole jest wymagane</Text>}
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Opis</FormLabel>
                                        <Textarea {...register('description')} />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Priorytet</FormLabel>
                                        <NumberInput min={1} max={10}>
                                            <NumberInputField {...register('priority')} />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Operator odpowiedzialny</FormLabel>
                                        <Select {...register('operator')}>
                                            <option value="">Wybierz operatora</option>
                                            {operatorsList.map(op => (
                                                <option key={op.value} value={op.value}>
                                                    {op.label}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl display="flex" alignItems="center">
                                        <FormLabel mb="0">Status</FormLabel>
                                        <Switch {...register('isActive')} />
                                    </FormControl>
                                </SimpleGrid>

                                <FormControl mt={6}>
                                    <FormLabel>Tagi</FormLabel>
                                    <HStack spacing={2} mb={2} flexWrap="wrap">
                                        {tags.map((tag, index) => (
                                            <Tag key={index} size="md" borderRadius="full" variant="solid" m={1}>
                                                <TagLabel>{tag}</TagLabel>
                                                <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                                            </Tag>
                                        ))}
                                    </HStack>
                                    <Input
                                        placeholder="Dodaj tag i naciśnij Enter"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddTag(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </FormControl>
                            </CardBody>
                        </Card>
                    </Box>

                    {/* Sekcja 2: Kontekst biznesowy */}
                    <Box>
                        <Card shadow="md" bg={useColorModeValue('white', 'gray.700')}>
                            <CardHeader>
                                <Heading size="md" color="gray.700">2. Kontekst biznesowy</Heading>
                            </CardHeader>
                            <CardBody>
                                <FormControl>
                                    <FormLabel fontWeight="medium">Specjalizacja firmy</FormLabel>
                                    <SimpleGrid columns={[2, null, 4]} spacing={3}>
                                        {specializationOptions.map((spec) => (
                                            <Tag
                                                key={spec}
                                                size="lg"
                                                variant={specialization.includes(spec) ? "solid" : "outline"}
                                                colorScheme="blue"
                                                cursor="pointer"
                                                onClick={() => handleToggleSpecialization(spec)}
                                                mb={2}
                                                borderRadius="md"
                                                boxShadow="sm"
                                                p={2}
                                            >
                                                <TagLabel>{spec}</TagLabel>
                                            </Tag>
                                        ))}
                                    </SimpleGrid>
                                </FormControl>

                                <FormControl mt={6}>
                                    <FormLabel fontWeight="medium">Priorytetowi klienci</FormLabel>
                                    <HStack spacing={2} mb={3} flexWrap="wrap">
                                        {priorityClients.map((client, index) => (
                                            <Tag key={index} size="md" borderRadius="md" variant="solid" colorScheme="green" m={1} p={2}>
                                                <TagLabel>{client}</TagLabel>
                                                <TagCloseButton onClick={() => handleRemovePriorityClient(client)} />
                                            </Tag>
                                        ))}
                                    </HStack>
                                    <Input
                                        placeholder="Dodaj klienta VIP i naciśnij Enter"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddPriorityClient(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </FormControl>

                                <FormControl mt={6}>
                                    <FormLabel fontWeight="medium">Preferowane rodzaje ładunków</FormLabel>
                                    <SimpleGrid columns={[2, null, 3]} spacing={3}>
                                        {cargoTypes.map((type) => (
                                            <Tag
                                                key={type}
                                                size="md"
                                                variant={preferredCargoTypes.includes(type) ? "solid" : "outline"}
                                                colorScheme="green"
                                                cursor="pointer"
                                                onClick={() => handleToggleCargoType(type, 'preferredCargoTypes')}
                                                mb={2}
                                                borderRadius="md"
                                                boxShadow="sm"
                                                p={2}
                                            >
                                                <TagLabel>{type}</TagLabel>
                                            </Tag>
                                        ))}
                                    </SimpleGrid>
                                </FormControl>

                                <FormControl mt={6}>
                                    <FormLabel fontWeight="medium">Niepożądane rodzaje ładunków</FormLabel>
                                    <SimpleGrid columns={[2, null, 3]} spacing={3}>
                                        {cargoTypes.map((type) => (
                                            <Tag
                                                key={type}
                                                size="md"
                                                variant={unwantedCargoTypes.includes(type) ? "solid" : "outline"}
                                                colorScheme="red"
                                                cursor="pointer"
                                                onClick={() => handleToggleCargoType(type, 'unwantedCargoTypes')}
                                                mb={2}
                                                borderRadius="md"
                                                boxShadow="sm"
                                                p={2}
                                            >
                                                <TagLabel>{type}</TagLabel>
                                            </Tag>
                                        ))}
                                    </SimpleGrid>
                                </FormControl>
                            </CardBody>
                        </Card>
                    </Box>

                    {/* Dodatkowe usługi */}
                    <Box>
                        <Card shadow="md" bg={useColorModeValue('white', 'gray.700')}>
                            <CardHeader>
                                <Heading size="md" color="gray.700">Dodatkowe usługi</Heading>
                            </CardHeader>
                            <CardBody>
                                <FormControl>
                                    <FormLabel fontWeight="medium">Wybierz oferowane usługi dodatkowe</FormLabel>
                                    <SimpleGrid columns={[2, null, 3]} spacing={3}>
                                        {additionalServices.map((service) => (
                                            <Tag
                                                key={service}
                                                size="md"
                                                variant={additionalServicesSelected.includes(service) ? "solid" : "outline"}
                                                colorScheme="blue"
                                                cursor="pointer"
                                                onClick={() => handleToggleAdditionalService(service)}
                                                mb={2}
                                                borderRadius="md"
                                                boxShadow="sm"
                                                p={2}
                                            >
                                                <TagLabel>{service}</TagLabel>
                                            </Tag>
                                        ))}
                                    </SimpleGrid>
                                </FormControl>
                            </CardBody>
                        </Card>
                    </Box>

                    {/* Sekcja 3: Parametry geograficzne */}
                    <Box>
                        <Card shadow="md" bg={useColorModeValue('white', 'gray.700')}>
                            <CardHeader>
                                <Heading size="md" color="gray.700">3. Parametry geograficzne</Heading>
                            </CardHeader>
                            <CardBody>
                                <SimpleGrid columns={[1, null, 2]} spacing={6}>
                                    <FormControl>
                                        <FormLabel fontWeight="medium">Maksymalny promień operacyjny (km)</FormLabel>
                                        <NumberInput min={0} max={2000}>
                                            <NumberInputField {...register('maxOperatingRadius')} />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontWeight="medium">Preferowane kraje</FormLabel>
                                        <SimpleGrid columns={[2, null, 4]} spacing={3}>
                                            {countriesList.map((country) => (
                                                <Tag
                                                    key={country}
                                                    size="md"
                                                    variant={preferredCountries.includes(country) ? "solid" : "outline"}
                                                    colorScheme="green"
                                                    cursor="pointer"
                                                    onClick={() => handleToggleCountry(country, 'preferredCountries')}
                                                    mb={2}
                                                    borderRadius="md"
                                                    boxShadow="sm"
                                                    p={2}
                                                >
                                                    <TagLabel>{country}</TagLabel>
                                                </Tag>
                                            ))}
                                        </SimpleGrid>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontWeight="medium">Kraje do unikania</FormLabel>
                                        <SimpleGrid columns={[2, null, 4]} spacing={3}>
                                            {countriesList.map((country) => (
                                                <Tag
                                                    key={country}
                                                    size="md"
                                                    variant={unwantedCountries.includes(country) ? "solid" : "outline"}
                                                    colorScheme="red"
                                                    cursor="pointer"
                                                    onClick={() => handleToggleCountry(country, 'unwantedCountries')}
                                                    mb={2}
                                                    borderRadius="md"
                                                    boxShadow="sm"
                                                    p={2}
                                                >
                                                    <TagLabel>{country}</TagLabel>
                                                </Tag>
                                            ))}
                                        </SimpleGrid>
                                    </FormControl>

                                    <FormControl mt={6}>
                                        <FormLabel fontWeight="medium">Preferencje drogowe</FormLabel>
                                        <SimpleGrid columns={[2, null, 4]} spacing={3}>
                                            {roadPreferences.map((preference) => (
                                                <Tag
                                                    key={preference}
                                                    size="md"
                                                    variant={roadPreferencesSelected.includes(preference) ? "solid" : "outline"}
                                                    colorScheme="blue"
                                                    cursor="pointer"
                                                    onClick={() => handleToggleRoadPreference(preference)}
                                                    mb={2}
                                                    borderRadius="md"
                                                    boxShadow="sm"
                                                    p={2}
                                                >
                                                    <TagLabel>{preference}</TagLabel>
                                                </Tag>
                                            ))}
                                        </SimpleGrid>
                                    </FormControl>

                                    <FormControl mt={6}>
                                        <FormLabel fontWeight="medium">Baza logistyczna (punkt startowy)</FormLabel>
                                        <Select {...register('selectedLogisticsBase')} onChange={(e) => handleSelectLogisticsBase(e.target.value)}>
                                            <option value="">Wybierz bazę logistyczną</option>
                                            {logisticsBases && logisticsBases.length > 0 ? (
                                                logisticsBases.map(base => (
                                                    <option key={base.id} value={base.id}>
                                                        {base.name}
                                                    </option>
                                                ))
                                            ) : (
                                                // Dodaj statyczne opcje, jeśli nie ma baz logistycznych
                                                <>
                                                    <option value="1">Baza Warszawa</option>
                                                    <option value="2">Baza Poznań</option>
                                                    <option value="3">Baza Kraków</option>
                                                    <option value="4">Baza Test 1</option>
                                                </>
                                            )}
                                        </Select>
                                    </FormControl>

                                    <FormControl mt={6}>
                                        <FormLabel fontWeight="medium">Punkt niestandardowy</FormLabel>
                                        <Button onClick={handleSelectCustomPoint}>Dodaj punkt niestandardowy</Button>
                                        {watch('customLogisticsPoint') && (
                                            <Box mt={4}>
                                                <FormControl>
                                                    <FormLabel>Szerokość geograficzna</FormLabel>
                                                    <Input type="number" {...register('customLogisticsPoint.latitude')} />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Długość geograficzna</FormLabel>
                                                    <Input type="number" {...register('customLogisticsPoint.longitude')} />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Nazwa punktu</FormLabel>
                                                    <Input {...register('customLogisticsPoint.name')} />
                                                </FormControl>
                                            </Box>
                                        )}
                                    </FormControl>
                                </SimpleGrid>
                            </CardBody>
                        </Card>
                    </Box>

                    {/* Sekcja 4: Parametry finansowe */}
                    <Box>
                        <Card shadow="md" bg={useColorModeValue('white', 'gray.700')}>
                            <CardHeader>
                                <Heading size="md" color="gray.700">4. Parametry finansowe</Heading>
                            </CardHeader>
                            <CardBody>
                                <SimpleGrid columns={[1, null, 2]} spacing={6}>
                                    <FormControl>
                                        <FormLabel fontWeight="medium">Minimalna stawka za km (PLN)</FormLabel>
                                        <NumberInput min={0} step={0.1} precision={2}>
                                            <NumberInputField {...register('minRatePerKm')} />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontWeight="medium">Docelowa stawka za km (PLN)</FormLabel>
                                        <NumberInput min={0} step={0.1} precision={2}>
                                            <NumberInputField {...register('targetRatePerKm')} />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontWeight="medium">Minimalna wartość zlecenia (PLN)</FormLabel>
                                        <NumberInput min={0} step={50}>
                                            <NumberInputField {...register('minOrderValue')} />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontWeight="medium">Koszt pustych km (PLN)</FormLabel>
                                        <NumberInput min={0} step={0.1} precision={2}>
                                            <NumberInputField {...register('emptyKmCost')} />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontWeight="medium">Minimalna marża zysku (%)</FormLabel>
                                        <NumberInput min={0} max={100} step={1}>
                                            <NumberInputField {...register('minProfitMargin')} />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>
                                </SimpleGrid>

                                <FormControl mt={6}>
                                    <FormLabel fontWeight="medium">Preferowane warunki płatności</FormLabel>
                                    <SimpleGrid columns={[2, null, 5]} spacing={3}>
                                        {paymentTerms.map((term) => (
                                            <Tag
                                                key={term}
                                                size="md"
                                                variant={preferredPaymentTerms.includes(term) ? "solid" : "outline"}
                                                colorScheme="blue"
                                                cursor="pointer"
                                                onClick={() => handleTogglePaymentTerm(term)}
                                                mb={2}
                                                borderRadius="md"
                                                boxShadow="sm"
                                                p={2}
                                            >
                                                <TagLabel>{term}</TagLabel>
                                            </Tag>
                                        ))}
                                    </SimpleGrid>
                                </FormControl>

                                <FormControl mt={6}>
                                    <FormLabel fontWeight="medium">Akceptowane waluty</FormLabel>
                                    <SimpleGrid columns={[2, null, 4]} spacing={3}>
                                        {currencies.map((currency) => (
                                            <Tag
                                                key={currency}
                                                size="md"
                                                variant={currenciesSelected.includes(currency) ? "solid" : "outline"}
                                                colorScheme="green"
                                                cursor="pointer"
                                                onClick={() => handleToggleCurrency(currency)}
                                                mb={2}
                                                borderRadius="md"
                                                boxShadow="sm"
                                                p={2}
                                            >
                                                <TagLabel>{currency}</TagLabel>
                                            </Tag>
                                        ))}
                                    </SimpleGrid>
                                </FormControl>
                            </CardBody>
                        </Card>
                    </Box>

                    {/* Sekcja 5: Integracja z TMS */}
                    <Box>
                        <Text fontSize="xl" fontWeight="bold" mb={4}>5. Integracja z TMS</Text>
                        
                        <SimpleGrid columns={[1, null, 2]} spacing={4}>
                            <FormControl>
                                <FormLabel>Parametry zapytania o dostępność</FormLabel>
                                <Textarea 
                                    placeholder="Konfiguracja parametrów zapytania o dostępność" 
                                    {...register('availabilityQueryParams')} 
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Minimalny bufor dostępności</FormLabel>
                                <NumberInput min={1} max={100} defaultValue={1}>
                                    <NumberInputField {...register('minAvailabilityBuffer', { min: 1, max: 100 })} />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Preferowane godziny</FormLabel>
                                <HStack>
                                    <Input type="time" {...register('preferredHours.start')} />
                                    <Text>do</Text>
                                    <Input type="time" {...register('preferredHours.end')} />
                                </HStack>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Maksymalny czas realizacji (godziny)</FormLabel>
                                <NumberInput min={1} max={720} defaultValue={48}>
                                    <NumberInputField {...register('maxExecutionTime', { min: 1, max: 720 })} />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Bufor czasowy (godziny)</FormLabel>
                                <NumberInput min={0} max={48} defaultValue={2}>
                                    <NumberInputField {...register('timeBuffer', { min: 0, max: 48 })} />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Aktualizacja dostępności</FormLabel>
                                <Select {...register('availabilityUpdateFrequency')}>
                                    {checkFrequencyOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Priorytet sprawdzania</FormLabel>
                                <Select {...register('checkPriority')}>
                                    <option value="beforeAnalysis">Przed analizą opłacalności</option>
                                    <option value="afterAnalysis">Po wstępnej analizie opłacalności</option>
                                    <option value="beforeNegotiation">Przed rozpoczęciem negocjacji</option>
                                </Select>
                            </FormControl>
                        </SimpleGrid>
                    </Box>

                    {/* Sekcja 6: Wymagania techniczne */}
                    <Box>
                        <Card shadow="md" bg={useColorModeValue('white', 'gray.700')}>
                            <CardHeader>
                                <Heading size="md" color="gray.700">6. Wymagania techniczne</Heading>
                            </CardHeader>
                            <CardBody>
                                <FormControl>
                                    <FormLabel fontWeight="medium">Typy naczep</FormLabel>
                                    <SimpleGrid columns={[2, null, 3]} spacing={3}>
                                        {trailerTypes.map((type) => (
                                            <Tag
                                                key={type}
                                                size="md"
                                                variant={trailerTypesSelected.includes(type) ? "solid" : "outline"}
                                                colorScheme="blue"
                                                cursor="pointer"
                                                onClick={() => handleToggleTrailerType(type)}
                                                mb={2}
                                                borderRadius="md"
                                                boxShadow="sm"
                                                p={2}
                                            >
                                                <TagLabel>{type}</TagLabel>
                                            </Tag>
                                        ))}
                                    </SimpleGrid>
                                </FormControl>

                                <SimpleGrid columns={[1, null, 2]} spacing={6} mt={6}>
                                    <FormControl>
                                        <FormLabel fontWeight="medium">Zakres ładowności (min-max ton)</FormLabel>
                                        <Flex>
                                            <NumberInput min={0} max={24} mr={4}>
                                                <NumberInputField 
                                                    {...register('liftCapacityRange.min')} 
                                                    placeholder="Min" 
                                                />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                            <NumberInput min={0} max={24}>
                                                <NumberInputField 
                                                    {...register('liftCapacityRange.max')} 
                                                    placeholder="Max" 
                                                />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </Flex>
                                    </FormControl>
                                </SimpleGrid>

                                <FormControl mt={6}>
                                    <FormLabel fontWeight="medium">Parametry ładunku (m)</FormLabel>
                                    <SimpleGrid columns={[1, null, 3]} spacing={4}>
                                        <FormControl>
                                            <FormLabel fontSize="sm">Szerokość</FormLabel>
                                            <NumberInput min={0} precision={2} step={0.1}>
                                                <NumberInputField {...register('cargoParameters.width')} />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="sm">Wysokość</FormLabel>
                                            <NumberInput min={0} precision={2} step={0.1}>
                                                <NumberInputField {...register('cargoParameters.height')} />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="sm">Długość</FormLabel>
                                            <NumberInput min={0} precision={2} step={0.1}>
                                                <NumberInputField {...register('cargoParameters.length')} />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </FormControl>
                                    </SimpleGrid>
                                </FormControl>

                                <FormControl mt={6}>
                                    <FormLabel fontWeight="medium">Wymagane wyposażenie specjalne</FormLabel>
                                    <SimpleGrid columns={[2, null, 3]} spacing={3}>
                                        {specialEquipment.map((equipment) => (
                                            <Tag
                                                key={equipment}
                                                size="md"
                                                variant={specialEquipmentSelected.includes(equipment) ? "solid" : "outline"}
                                                colorScheme="purple"
                                                cursor="pointer"
                                                onClick={() => handleToggleSpecialEquipment(equipment)}
                                                mb={2}
                                                borderRadius="md"
                                                boxShadow="sm"
                                                p={2}
                                            >
                                                <TagLabel>{equipment}</TagLabel>
                                            </Tag>
                                        ))}
                                    </SimpleGrid>
                                </FormControl>

                                <FormControl mt={6}>
                                    <FormLabel fontWeight="medium">Wymagane certyfikaty</FormLabel>
                                    <SimpleGrid columns={[2, null, 3]} spacing={3}>
                                        {certificates.map((cert) => (
                                            <Tag
                                                key={cert}
                                                size="md"
                                                variant={certificatesSelected.includes(cert) ? "solid" : "outline"}
                                                colorScheme="teal"
                                                cursor="pointer"
                                                onClick={() => handleToggleCertificate(cert)}
                                                mb={2}
                                                borderRadius="md"
                                                boxShadow="sm"
                                                p={2}
                                            >
                                                <TagLabel>{cert}</TagLabel>
                                            </Tag>
                                        ))}
                                    </SimpleGrid>
                                </FormControl>

                                <FormControl mt={6}>
                                    <FormLabel fontWeight="medium">Specjalne wymagania</FormLabel>
                                    <Textarea 
                                        placeholder="Wprowadź dodatkowe wymagania techniczne" 
                                        {...register('specialRequirements')} 
                                    />
                                </FormControl>
                            </CardBody>
                        </Card>
                    </Box>

                    {/* Sekcja 7: Ustawienia negocjacji */}
                    <Box>
                        <Card shadow="md" bg={useColorModeValue('white', 'gray.700')}>
                            <CardHeader>
                                <Heading size="md" color="gray.700">7. Ustawienia negocjacji</Heading>
                            </CardHeader>
                            <CardBody>
                                <SimpleGrid columns={[1, null, 2]} spacing={6}>
                                    <FormControl>
                                        <FormLabel fontWeight="medium">Poziom agresywności negocjacji</FormLabel>
                                        <Slider 
                                            defaultValue={3} 
                                            min={1} 
                                            max={5} 
                                            step={1}
                                            onChange={(val) => setValue('negotiationAggressiveness', val)}
                                            mb={2}
                                        >
                                            <SliderTrack bg="gray.200">
                                                <SliderFilledTrack bg="blue.500" />
                                            </SliderTrack>
                                            <SliderThumb boxSize={6} bg="blue.500">
                                                <Box color="white" as={FiSliders} />
                                            </SliderThumb>
                                        </Slider>
                                        <Flex justify="space-between">
                                            <Text fontSize="sm">Pasywny</Text>
                                            <Text fontSize="sm">Zrównoważony</Text>
                                            <Text fontSize="sm">Agresywny</Text>
                                        </Flex>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontWeight="medium">Maksymalna liczba kontrpropozycji</FormLabel>
                                        <NumberInput min={1} max={10} defaultValue={3}>
                                            <NumberInputField {...register('maxCounterOffers')} />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontWeight="medium">Minimalny czas oczekiwania na odpowiedź (min)</FormLabel>
                                        <NumberInput min={1} max={1440}>
                                            <NumberInputField {...register('minResponseTime')} />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontWeight="medium">Maksymalny czas oczekiwania na odpowiedź (min)</FormLabel>
                                        <NumberInput min={1} max={1440}>
                                            <NumberInputField {...register('maxResponseTime')} />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>
                                </SimpleGrid>

                                <FormControl mt={6}>
                                    <FormLabel fontWeight="medium">Strategie negocjacyjne</FormLabel>
                                    <SimpleGrid columns={[2, null, 3]} spacing={3}>
                                        {negotiationStrategies.map((strategy) => (
                                            <Tag
                                                key={strategy.value}
                                                size="md"
                                                variant={negotiationStrategiesSelected.includes(strategy.value) ? "solid" : "outline"}
                                                colorScheme="blue"
                                                cursor="pointer"
                                                onClick={() => handleAddNegotiationArgument(strategy.value)}
                                                mb={2}
                                                borderRadius="md"
                                                boxShadow="sm"
                                                p={2}
                                            >
                                                {strategy.label}
                                            </Tag>
                                        ))}
                                    </SimpleGrid>
                                </FormControl>

                                <FormControl mt={6}>
                                    <FormLabel fontWeight="medium">Dodatkowe instrukcje negocjacyjne</FormLabel>
                                    <Textarea 
                                        placeholder="Wprowadź dodatkowe instrukcje dotyczące negocjacji" 
                                        {...register('negotiationInstructions')} 
                                    />
                                </FormControl>
                            </CardBody>
                        </Card>
                    </Box>

                    {/* Sekcja 8: Warunki przełączenia na operatora */}
                    <Box>
                        <Text fontSize="xl" fontWeight="bold" mb={4}>8. Warunki przełączenia na operatora</Text>
                        
                        <SimpleGrid columns={[1, null, 2]} spacing={4}>
                            <FormControl>
                                <FormLabel>Próg cenowy (%)</FormLabel>
                                <NumberInput min={0} max={100} defaultValue={15}>
                                    <NumberInputField {...register('priceThreshold', { min: 0, max: 100 })} />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                                <Text fontSize="xs" color="gray.500">Odchylenie od oczekiwanej stawki</Text>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Wykrywanie emocji</FormLabel>
                                <Box px={2}>
                                    <Text fontSize="xs" mb={1}>Niski poziom</Text>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        defaultValue="50"
                                        {...register('emotionDetectionLevel')}
                                        style={{ width: '100%' }}
                                    />
                                    <Text fontSize="xs" textAlign="right">Wysoki poziom</Text>
                                </Box>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Przekroczenie czasu (minuty)</FormLabel>
                                <NumberInput min={1} max={60} defaultValue={15}>
                                    <NumberInputField {...register('maxClientIdleTime', { min: 1, max: 60 })} />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                                <Text fontSize="xs" color="gray.500">Maksymalny czas na odpowiedź asystenta</Text>
                            </FormControl>
                        </SimpleGrid>

                        <FormControl mt={4}>
                            <FormLabel>Nietypowe wymagania kontrahenta</FormLabel>
                            <HStack spacing={2} mb={2}>
                                {unusualClientRequirements.map((req, index) => (
                                    <Tag key={index} size="md" borderRadius="full" variant="solid" colorScheme="orange">
                                        <TagLabel>{req}</TagLabel>
                                        <TagCloseButton onClick={() => handleRemoveUnusualClientRequirement(req)} />
                                    </Tag>
                                ))}
                            </HStack>
                            <Input
                                placeholder="Dodaj wymaganie i naciśnij Enter"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddUnusualClientRequirement(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </FormControl>

                        <FormControl mt={4}>
                            <FormLabel>Słowa kluczowe</FormLabel>
                            <HStack spacing={2} mb={2}>
                                {keywordTriggers.map((keyword, index) => (
                                    <Tag key={index} size="md" borderRadius="full" variant="solid" colorScheme="yellow">
                                        <TagLabel>{keyword}</TagLabel>
                                        <TagCloseButton onClick={() => handleRemoveKeywordTrigger(keyword)} />
                                    </Tag>
                                ))}
                            </HStack>
                            <Input
                                placeholder="Dodaj słowo kluczowe i naciśnij Enter"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddKeywordTrigger(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </FormControl>

                        <FormControl mt={4}>
                            <FormLabel>Etapy negocjacji wymagające interwencji człowieka</FormLabel>
                            <SimpleGrid columns={[1, null, 2]} spacing={2}>
                                {negotiationStages.map((stage) => (
                                    <Tag
                                        key={stage}
                                        size="md"
                                        variant={negotiationStagesRequiringHuman.includes(stage) ? "solid" : "outline"}
                                        colorScheme="red"
                                        cursor="pointer"
                                        onClick={() => handleToggleNegotiationStage(stage)}
                                    >
                                        <TagLabel>{stage}</TagLabel>
                                    </Tag>
                                ))}
                            </SimpleGrid>
                        </FormControl>
                    </Box>

                    {/* Sekcja 9: Harmonogram pracy agenta */}
                    <Box>
                        <Text fontSize="xl" fontWeight="bold" mb={4}>9. Harmonogram pracy agenta</Text>
                        <SimpleGrid columns={[1, null, 2]} spacing={4}>
                            <FormControl>
                                <FormLabel>Częstotliwość sprawdzania giełdy</FormLabel>
                                <Select {...register('checkFrequency')}>
                                    {checkFrequencyOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            {checkFrequency === 'custom' && (
                                <FormControl>
                                    <FormLabel>Interwał sprawdzania (minuty)</FormLabel>
                                    <NumberInput min={1} max={1440}>
                                        <NumberInputField {...register('customCheckInterval', { min: 1, max: 1440 })} />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                    {errors.customCheckInterval && <Text color="red">Wartość musi być między 1 a 1440</Text>}
                                </FormControl>
                            )}

                            <FormControl>
                                <FormLabel>Godziny pracy</FormLabel>
                                <HStack>
                                    <Input type="time" {...register('workingHours.start')} />
                                    <Text>do</Text>
                                    <Input type="time" {...register('workingHours.end')} />
                                </HStack>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Dni aktywności</FormLabel>
                                <SimpleGrid columns={[2, null, 4]} spacing={2}>
                                    {daysOfWeek.map((day) => (
                                        <Tag
                                            key={day.value}
                                            size="lg"
                                            variant={watch('workingDays')?.includes(day.value) ? "solid" : "outline"}
                                            colorScheme="blue"
                                            cursor="pointer"
                                            onClick={() => {
                                                const days = watch('workingDays') || [];
                                                if (days.includes(day.value)) {
                                                    setValue('workingDays', days.filter(d => d !== day.value));
                                                } else {
                                                    setValue('workingDays', [...days, day.value]);
                                                }
                                            }}
                                        >
                                            <TagLabel>{day.label}</TagLabel>
                                        </Tag>
                                    ))}
                                </SimpleGrid>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Intensywność pracy</FormLabel>
                                <Select {...register('workIntensity')}>
                                    {workIntensityOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Limit sesji równoległych</FormLabel>
                                <NumberInput min={1} max={10}>
                                    <NumberInputField {...register('maxConcurrentNegotiations', { min: 1, max: 10 })} />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                                {errors.maxConcurrentNegotiations && <Text color="red">Wartość musi być między 1 a 10</Text>}
                            </FormControl>
                        </SimpleGrid>

                        <FormControl mt={4}>
                            <FormLabel>Wyjątki w harmonogramie</FormLabel>
                            <Box border="1px" borderColor="gray.200" borderRadius="md" p={3} mb={3}>
                                {scheduleExceptions.map((exception, index) => (
                                    <HStack key={index} mb={2}>
                                        <Text flex="1">{exception.date}</Text>
                                        <Text>{exception.isActive ? 'Aktywny' : 'Nieaktywny'}</Text>
                                        <Button size="sm" colorScheme="red" onClick={() => handleRemoveScheduleException(exception.date)}>
                                            Usuń
                                        </Button>
                                    </HStack>
                                ))}
                                <HStack mt={2}>
                                    <Input type="date" id="exceptionDate" />
                                    <Select id="exceptionStatus" defaultValue="false">
                                        <option value="true">Aktywny</option>
                                        <option value="false">Nieaktywny</option>
                                    </Select>
                                    <Button 
                                        colorScheme="blue" 
                                        onClick={() => {
                                            const date = document.getElementById('exceptionDate').value;
                                            const isActive = document.getElementById('exceptionStatus').value === 'true';
                                            if (date) {
                                                handleAddScheduleException(date, isActive);
                                                document.getElementById('exceptionDate').value = '';
                                            }
                                        }}
                                    >
                                        Dodaj
                                    </Button>
                                </HStack>
                            </Box>
                        </FormControl>
                    </Box>

                    {/* Przyciski akcji */}
                    <Flex justify="space-between" mt={8} mb={8}>
                        <Button 
                            colorScheme="gray" 
                            onClick={() => navigate('/agents')}
                            leftIcon={<FiArrowLeft />}
                        >
                            Anuluj
                        </Button>
                        <ButtonGroup>
                            <Button 
                                colorScheme="blue" 
                                type="submit"
                                isLoading={isSubmitting}
                                loadingText="Zapisywanie..."
                                leftIcon={<FiSave />}
                                boxShadow="md"
                            >
                                {isEditing ? 'Zapisz zmiany' : 'Zapisz profil'}
                            </Button>
                        </ButtonGroup>
                    </Flex>
                </VStack>
            </form>
        </Box>
    );
 };
