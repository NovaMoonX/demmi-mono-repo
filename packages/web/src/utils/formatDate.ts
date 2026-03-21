export function formatDateShort(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDayShort(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { weekday: 'short' });
}

export function getStartOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function getWeekStart(ts: number): number {
  const d = new Date(getStartOfDay(ts));
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d.getTime();
}

export function getDaysInRange(start: number, end: number): number[] {
  const days: number[] = [];
  const startDay = getStartOfDay(start);
  const endDay = getStartOfDay(end);
  
  const currentDate = new Date(startDay);
  const endDate = new Date(endDay);
  
  while (currentDate <= endDate) {
    days.push(currentDate.getTime());
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}

export function formatDateFull(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateInput(ts: number): string {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateInput(value: string): number {
  const result = getStartOfDay(new Date(`${value}T00:00:00`).getTime());
  return result;
}