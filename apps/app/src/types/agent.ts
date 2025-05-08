export type CheckFrequency = 'live' | 'hourly' | '30min' | '15min' | 'custom';

export interface Agent {
    id: string;
    name: string;
    isActive: boolean;
    checkFrequency: CheckFrequency;
    customCheckInterval?: number; // w minutach, tylko dla checkFrequency === 'custom'
    maxConcurrentNegotiations: number;
    workingHours: {
        start: string; // format "HH:mm"
        end: string; // format "HH:mm"
    };
    isDraft: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AgentFormData extends Omit<Agent, 'id' | 'createdAt' | 'updatedAt'> {}
