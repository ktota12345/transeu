// Stałe dla częstotliwości sprawdzania
export const CHECK_FREQUENCY = {
    LIVE: 'live',
    HOURLY: 'hourly',
    MIN_30: '30min',
    MIN_15: '15min',
    CUSTOM: 'custom'
};

// Przykładowa struktura agenta
/*
{
    id: string,
    name: string,
    isActive: boolean,
    checkFrequency: 'live' | 'hourly' | '30min' | '15min' | 'custom',
    customCheckInterval?: number, // w minutach, tylko dla checkFrequency === 'custom'
    maxConcurrentNegotiations: number,
    workingHours: {
        start: string, // format "HH:mm"
        end: string, // format "HH:mm"
    },
    isDraft: boolean,
    createdAt: string,
    updatedAt: string
}
*/
