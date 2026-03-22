import {
  formatDateShort,
  formatDayShort,
  getStartOfDay,
  getWeekStart,
  getDaysInRange,
  formatDateFull,
  formatDateInput,
  parseDateInput,
} from './formatDate';

describe('formatDateShort', () => {
  it('formats a timestamp as short date (e.g. "Jan 15")', () => {
    const ts = new Date(2025, 0, 15).getTime();
    const result = formatDateShort(ts);
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/15/);
  });
});

describe('formatDayShort', () => {
  it('returns a short weekday name', () => {
    const monday = new Date(2025, 0, 6).getTime();
    const result = formatDayShort(monday);
    expect(result).toBe('Mon');
  });
});

describe('getStartOfDay', () => {
  it('returns timestamp at midnight for the given date', () => {
    const ts = new Date(2025, 5, 15, 14, 30, 45).getTime();
    const result = getStartOfDay(ts);
    const date = new Date(result);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
    expect(date.getMilliseconds()).toBe(0);
    expect(date.getDate()).toBe(15);
  });
});

describe('getWeekStart', () => {
  it('returns the start of the week (Sunday) for a given date', () => {
    const wednesday = new Date(2025, 0, 8).getTime();
    const result = getWeekStart(wednesday);
    const date = new Date(result);
    expect(date.getDay()).toBe(0);
    expect(date.getDate()).toBe(5);
  });

  it('returns the same day if it is already Sunday', () => {
    const sunday = new Date(2025, 0, 5).getTime();
    const result = getWeekStart(sunday);
    const date = new Date(result);
    expect(date.getDay()).toBe(0);
    expect(date.getDate()).toBe(5);
  });
});

describe('getDaysInRange', () => {
  it('returns an array of start-of-day timestamps for each day in the range', () => {
    const start = new Date(2025, 0, 1).getTime();
    const end = new Date(2025, 0, 3).getTime();
    const result = getDaysInRange(start, end);
    expect(result).toHaveLength(3);
    expect(new Date(result[0]).getDate()).toBe(1);
    expect(new Date(result[1]).getDate()).toBe(2);
    expect(new Date(result[2]).getDate()).toBe(3);
  });

  it('returns a single day when start equals end', () => {
    const day = new Date(2025, 0, 1).getTime();
    const result = getDaysInRange(day, day);
    expect(result).toHaveLength(1);
  });
});

describe('formatDateFull', () => {
  it('formats a timestamp as a full date string', () => {
    const ts = new Date(2025, 0, 15).getTime();
    const result = formatDateFull(ts);
    expect(result).toMatch(/Wednesday/);
    expect(result).toMatch(/January/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2025/);
  });
});

describe('formatDateInput', () => {
  it('formats a timestamp as YYYY-MM-DD for input fields', () => {
    const ts = new Date(2025, 0, 5).getTime();
    const result = formatDateInput(ts);
    expect(result).toBe('2025-01-05');
  });

  it('pads month and day with leading zeros', () => {
    const ts = new Date(2025, 2, 3).getTime();
    const result = formatDateInput(ts);
    expect(result).toBe('2025-03-03');
  });
});

describe('parseDateInput', () => {
  it('parses a YYYY-MM-DD string to start-of-day timestamp', () => {
    const result = parseDateInput('2025-01-15');
    const date = new Date(result);
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(15);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
  });
});
