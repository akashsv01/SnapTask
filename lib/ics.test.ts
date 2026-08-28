import { describe, expect, it } from 'vitest';
import { canCreateIcs, createIcs, escapeIcsText, foldIcsLine } from './ics';

describe('ICS generation', () => {
  it('creates an importable timed event with escaped text', () => {
    const result = createIcs(
      {
        title: 'DevFest DC, 2026',
        startDateTime: '2026-08-28T09:30:00-04:00',
        endDateTime: '2026-08-28T17:00:00-04:00',
        location: 'Fuse at Mason Square; Arlington, VA',
        description: 'Check in early\nBring your ticket.',
      },
      new Date('2026-08-27T12:00:00Z'),
    );

    expect(result).toContain('BEGIN:VCALENDAR\r\n');
    expect(result).toContain('DTSTART:20260828T133000Z');
    expect(result).toContain('DTEND:20260828T210000Z');
    expect(result).toContain('SUMMARY:DevFest DC\\, 2026');
    expect(result).toContain('LOCATION:Fuse at Mason Square\\; Arlington\\, VA');
    expect(result).toContain('DESCRIPTION:Check in early\\nBring your ticket.');
    expect(result.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  it('uses an exclusive next-day end for an all-day event', () => {
    const result = createIcs({ title: 'Conference day', startDateTime: '2026-08-28', allDay: true });
    expect(result).toContain('DTSTART;VALUE=DATE:20260828');
    expect(result).toContain('DTEND;VALUE=DATE:20260829');
  });

  it('requires a usable title and start date', () => {
    expect(canCreateIcs({ title: 'Useful', startDateTime: 'not-a-date' })).toBe(false);
    expect(() => createIcs({ title: 'Useful', startDateTime: 'not-a-date' })).toThrow();
  });

  it('escapes calendar text and folds physical lines to 75 bytes', () => {
    expect(escapeIcsText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
    const folded = foldIcsLine(`DESCRIPTION:${'é'.repeat(80)}`);
    for (const line of folded.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });
});
