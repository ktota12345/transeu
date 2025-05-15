const daysMap: Record<string, string> = {
    pn: 'Poniedziałek',
    wt: 'Wtorek',
    sr: 'Środa',
    czw: 'Czwartek',
    pt: 'Piątek',
    sob: 'Sobota',
    nd: 'Niedziela',
};

// Funkcja do formatowania czasu ISO na HH:mm
function formatTime(isoString: string) {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

export function formatScheduleSummary(schedule: any) {
    if (!schedule) return '-';

    if (Array.isArray(schedule)) {
        return schedule
            .map(({ day, hours }: { day: string; hours: string[] }) => {
                const dayName = daysMap[day] || day;
                if (!Array.isArray(hours) || hours.length === 0) return `${dayName}: brak`;
                const formattedHours = hours.map(formatTime).join(', ');
                return `${dayName}: ${formattedHours}`;
            })
            .join(' | ');
    }

    if (typeof schedule === 'object') {
        return Object.entries(schedule)
            .map(([day, hours]) => {
                const dayName = daysMap[day] || day;
                if (!Array.isArray(hours) || hours.length === 0) return `${dayName}: brak`;
                const formattedHours = hours.map(formatTime).join(', ');
                return `${dayName}: ${formattedHours}`;
            })
            .join(' | ');
    }

    return '-';
}


export const preprocessScheduleForEdit = (schedule: any) => {
    if (!schedule || typeof schedule !== 'object') return [];
    return Object.entries(schedule).map(([day, hours]) => ({
        day,
        hours,
    }));
};

export  const transformScheduleOnSave = (data: any) => {
    const schedule: Record<string, string[]> = {};
    data.schedule.forEach((entry: any) => {
        schedule[entry.day] = entry.hours?.filter(Boolean) || [];
    });
    return schedule;
};