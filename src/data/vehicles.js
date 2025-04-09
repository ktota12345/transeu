export const vehicles = [
  {
    id: 'TRK-001',
    name: 'Scania R450 (Standard)',
    model: 'Scania R450',
    type: 'Ciągnik siodłowy + Naczepa standard',
    capacity: '24t, 33 palety EUR',
    features: ['GPS', 'Monitorowanie temperatury', 'System telematyczny'],
    availability: 'Dostępny',
    baseLocation: 'Warszawa, Polska',
    currentStatus: 'Wolny',
    driver: 'Jan Kowalski'
  },
  {
    id: 'TRK-002',
    name: 'Volvo FH (Chłodnia)',
    model: 'Volvo FH Globetrotter',
    type: 'Ciągnik siodłowy + Naczepa chłodnia',
    capacity: '22t, 33 palety EUR',
    features: ['GPS', 'Agregat chłodniczy Carrier', 'Rejestrator temperatury', 'ATP'],
    availability: 'W trasie',
    baseLocation: 'Gdańsk, Polska',
    currentStatus: 'W trasie (ORD-2025-0413)',
    driver: 'Marek Zając'
  },
  {
    id: 'TRK-003',
    name: 'MAN TGX (Cysterna ADR)',
    model: 'MAN TGX XXL',
    type: 'Ciągnik siodłowy + Cysterna paliwowa ADR',
    capacity: '25000L',
    features: ['GPS', 'ADR (klasa 3)', 'System dozowania', 'Zabezpieczenia przeciwwybuchowe'],
    availability: 'W trakcie serwisu',
    baseLocation: 'Poznań, Polska',
    currentStatus: 'Przegląd techniczny (SRV-2025-0401)',
    driver: 'Krzysztof Baran'
  }
];
