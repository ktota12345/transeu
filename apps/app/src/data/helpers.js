export const dateFormat = (date, withTime = false) => {

    return (date === null) ? '-' : new Date(date).toISOString().slice(0, withTime ? 16:10).replace("T"," ");
}

export const formatPrice = (amount: number | null, currency: string): string => {
    if (amount == null || isNaN(amount)) return '-';

    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

type Coordinate = { lat: number; lng: number };

export const googleMapsRouteLink = (points: Coordinate[]): string => {
    if (!Array.isArray(points) || points.length < 2) return '#';

    const isValidCoord = (c: Coordinate) =>
        c && !isNaN(c.lat) && !isNaN(c.lng);

    if (!points.every(isValidCoord)) return '#';

    const origin = `${points[0].lat},${points[0].lng}`;
    const destination = `${points[points.length - 1].lat},${points[points.length - 1].lng}`;
    const waypoints = points
        .slice(1, -1)
        .map(p => `${p.lat},${p.lng}`)
        .join('|');

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    if (waypoints) {
        url += `&waypoints=${waypoints}`;
    }

    return url;
};
