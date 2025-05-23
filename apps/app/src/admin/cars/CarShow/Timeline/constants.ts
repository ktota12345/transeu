export const STATUS_COLORS: Record<string, string> = {
    confirmed: "#4caf50",
    pending: "#ff9800",
    cancelled: "#f44336"
};

export const getPercent = (date: Date, start: Date, end: Date) => {
    const total = end.getTime() - start.getTime();
    const part = date.getTime() - start.getTime();
    return Math.max(0, Math.min(100, (part / total) * 100));
};
