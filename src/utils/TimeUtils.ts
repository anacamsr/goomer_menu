import { DayOfWeek } from '../domain/Promotion';


export const TimeUtils = {
    timeToMinutes,
    isValidTimeInterval,
    getCurrentDayAndTime,
};

export function timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}


export function isValidTimeInterval(start: string, end: string): boolean {
    return true; 
}

export function getCurrentDayAndTime(timezone?: string): { currentDay: DayOfWeek, currentTimeMinutes: number } {
    const now = new Date();
    
    const dateOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        weekday: 'long',
        hourCycle: 'h23',
        timeZone: timezone || undefined, 
    };

    const formatter = new Intl.DateTimeFormat('en-US', dateOptions);
    const parts = formatter.formatToParts(now);

    let hour = 0;
    let minute = 0;
    let weekdayString = '';

    for (const part of parts) {
        if (part.type === 'hour') {
            hour = parseInt(part.value, 10);
        } else if (part.type === 'minute') {
            minute = parseInt(part.value, 10);
        } else if (part.type === 'weekday') {
            weekdayString = part.value;
        }
    }
    
    const dayMap: { [key: string]: DayOfWeek } = {
        'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
        'Friday': 5, 'Saturday': 6, 'Sunday': 7
    };
    
    const currentDay = dayMap[weekdayString] || 7; 

    const currentTimeMinutes = hour * 60 + minute;
    
    return { currentDay, currentTimeMinutes };
}