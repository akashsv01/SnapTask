export interface CalendarEventData {
  title: string;
  startDateTime: string;
  endDateTime?: string | null;
  allDay?: boolean | null;
  location?: string | null;
  description?: string | null;
}

interface FormattedDate {
  property: string;
  value: string;
  kind: 'date' | 'utc' | 'floating';
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const FLOATING_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function formatUtc(date: Date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function formatFloating(date: Date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function addDaysToDateOnly(value: string, days: number) {
  const match = DATE_ONLY.exec(value);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + days));
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}

function formatDate(value: string, allDay = false): FormattedDate | null {
  const dateOnly = DATE_ONLY.exec(value);
  if (dateOnly) {
    return {
      property: 'VALUE=DATE',
      value: `${dateOnly[1]}${dateOnly[2]}${dateOnly[3]}`,
      kind: 'date',
    };
  }

  const floating = FLOATING_DATE_TIME.exec(value);
  if (floating && !allDay) {
    return {
      property: '',
      value: `${floating[1]}${floating[2]}${floating[3]}T${floating[4]}${floating[5]}${floating[6] ?? '00'}`,
      kind: 'floating',
    };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return { property: '', value: formatUtc(date), kind: 'utc' };
}

function defaultEnd(start: string, formattedStart: FormattedDate): FormattedDate {
  if (formattedStart.kind === 'date') {
    return { property: 'VALUE=DATE', value: addDaysToDateOnly(start, 1)!, kind: 'date' };
  }

  if (formattedStart.kind === 'floating') {
    const match = FLOATING_DATE_TIME.exec(start)!;
    const date = new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]) + 60,
      Number(match[6] ?? 0),
    );
    return { property: '', value: formatFloating(date), kind: 'floating' };
  }

  const date = new Date(start);
  date.setUTCMinutes(date.getUTCMinutes() + 60);
  return { property: '', value: formatUtc(date), kind: 'utc' };
}

export function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

export function foldIcsLine(line: string) {
  const encoder = new TextEncoder();
  const pieces: string[] = [];
  let current = '';
  let limit = 75;

  for (const character of line) {
    if (encoder.encode(current + character).length > limit) {
      pieces.push(current);
      current = character;
      limit = 74;
    } else {
      current += character;
    }
  }
  if (current) pieces.push(current);
  return pieces.join('\r\n ');
}

function hash(value: string) {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  }
  return result.toString(36);
}

function dateLine(name: 'DTSTART' | 'DTEND', date: FormattedDate) {
  return `${name}${date.property ? `;${date.property}` : ''}:${date.value}`;
}

export function canCreateIcs(event: CalendarEventData | null | undefined) {
  return Boolean(event?.title && event.startDateTime && formatDate(event.startDateTime, Boolean(event.allDay)));
}

export function createIcs(event: CalendarEventData, now = new Date()): string {
  const start = formatDate(event.startDateTime, Boolean(event.allDay));
  if (!event.title.trim() || !start) throw new Error('A valid event title and start date are required.');

  let end = event.endDateTime ? formatDate(event.endDateTime, Boolean(event.allDay)) : null;
  if (!end || end.kind !== start.kind || end.value <= start.value) {
    end = defaultEnd(event.startDateTime, start);
  }

  const uid = `${hash(`${event.title}|${event.startDateTime}|${event.location ?? ''}`)}@snaptask.app`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SnapTask//Screenshot Actions//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatUtc(now)}`,
    dateLine('DTSTART', start),
    dateLine('DTEND', end),
    `SUMMARY:${escapeIcsText(event.title)}`,
    ...(event.location ? [`LOCATION:${escapeIcsText(event.location)}`] : []),
    ...(event.description ? [`DESCRIPTION:${escapeIcsText(event.description)}`] : []),
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
}
