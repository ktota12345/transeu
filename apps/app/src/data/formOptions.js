export const checkFrequencyOptions = [
    { value: 'live', label: 'Na żywo (ciągłe monitorowanie)' },
    { value: 'hourly', label: 'Co godzinę' },
    { value: '30min', label: 'Co 30 minut' },
    { value: '15min', label: 'Co 15 minut' },
    { value: 'custom', label: 'Niestandardowa' }
];

export const operatorsList = [
    { value: 'op1', label: 'Jan Kowalski' },
    { value: 'op2', label: 'Anna Nowak' },
    { value: 'op3', label: 'Piotr Wiśniewski' }
];

export const specializationOptions = [
    'przewozy standardowe',
    'chłodnicze',
    'ADR',
    'ponadgabarytowe'
];

export const daysOfWeek = [
    { value: 'mon', label: 'Poniedziałek' },
    { value: 'tue', label: 'Wtorek' },
    { value: 'wed', label: 'Środa' },
    { value: 'thu', label: 'Czwartek' },
    { value: 'fri', label: 'Piątek' },
    { value: 'sat', label: 'Sobota' },
    { value: 'sun', label: 'Niedziela' }
];

export const cargoTypes = [
    'Palety',
    'Drobnica',
    'Całopojazdowe',
    'Częściowe',
    'Chłodnicze',
    'Mrożone',
    'ADR',
    'Ponadgabarytowe'
];

export const additionalServices = [
    'Obsługa celna',
    'Magazynowanie',
    'Konsolidacja ładunków',
    'Rozładunek',
    'Załadunek',
    'Ubezpieczenie'
];

export const preferredCountries = [
    { value: 'PL', label: 'Polska' },
    { value: 'DE', label: 'Niemcy' },
    { value: 'CZ', label: 'Czechy' },
    { value: 'SK', label: 'Słowacja' },
    { value: 'FR', label: 'Francja' },
    { value: 'IT', label: 'Włochy' },
    { value: 'NL', label: 'Holandia' },
    { value: 'BE', label: 'Belgia' }
];

export const roadPreferences = [
    { value: 'highways', label: 'Autostrady' },
    { value: 'express', label: 'Drogi ekspresowe' },
    { value: 'national', label: 'Drogi krajowe' },
    { value: 'other', label: 'Inne' }
];

export const paymentTerms = [
    { value: '7', label: '7 dni' },
    { value: '14', label: '14 dni' },
    { value: '30', label: '30 dni' },
    { value: '45', label: '45 dni' },
    { value: '60', label: '60 dni' }
];

export const currencies = [
    { value: 'PLN', label: 'PLN' },
    { value: 'EUR', label: 'EUR' },
    { value: 'USD', label: 'USD' }
];

export const trailerTypes = [
    { value: 'tarpaulin', label: 'Plandeka' },
    { value: 'refrigerated', label: 'Chłodnia' },
    { value: 'platform', label: 'Platforma' },
    { value: 'silo', label: 'Silos' },
    { value: 'tank', label: 'Cysterna' }
];

export const specialEquipment = [
    { value: 'lift', label: 'Winda' },
    { value: 'forklift', label: 'Wózek widłowy' },
    { value: 'gps', label: 'GPS' },
    { value: 'tempMonitoring', label: 'System monitoringu temperatury' }
];

export const certificates = [
    { value: 'adr', label: 'ADR' },
    { value: 'atp', label: 'ATP' },
    { value: 'haccp', label: 'HACCP' },
    { value: 'iso', label: 'ISO' },
    { value: 'gdp', label: 'GDP' }
];

export const negotiationStrategies = [
    { value: 'aggressive', label: 'Agresywna' },
    { value: 'moderate', label: 'Umiarkowana' },
    { value: 'flexible', label: 'Elastyczna' }
];

export const negotiationStages = [
    { value: 'initial', label: 'Początkowa oferta' },
    { value: 'counter', label: 'Kontrpropozycja' },
    { value: 'conditions', label: 'Ustalanie warunków dodatkowych' },
    { value: 'final', label: 'Finalizacja' }
];
