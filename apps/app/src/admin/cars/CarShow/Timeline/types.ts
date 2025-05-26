
export type Offer = {
    id: number;
    from: Date;
    to: Date;
    latestFrom?: Date;
    earliestTo?: Date;
    status: string;
    fromCity: string;
    fromCountry?: string;
    toCity: string;
    toCountry?: string;
    details: string;
};
