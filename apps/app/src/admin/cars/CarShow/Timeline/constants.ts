export type OfferStatus = "confirmed" | "rejected" | "pending";

export const OFFER_STATUSES: { value: OfferStatus; label: string }[] = [
    { value: "confirmed", label: "Akceptuj" },
    { value: "rejected", label: "Odrzuć" },
    { value: "pending", label: "Oczekuje" }
];

export const STATUS_COLORS: Record<OfferStatus | "hover", string> = {
    confirmed: "#4caf50",
    pending: "#ff9800",
    rejected: "#f44336",
    hover: "#888888"
};

export const getPercent = (date: Date, start: Date, end: Date) => {
    const total = end.getTime() - start.getTime();
    const part = date.getTime() - start.getTime();
    return Math.max(0, Math.min(100, (part / total) * 100));
};
