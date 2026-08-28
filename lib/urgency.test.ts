import { describe, expect, it } from 'vitest';
import { resolveUrgency } from './urgency';

const now = new Date('2026-08-27T12:00:00Z');

describe('deterministic urgency', () => {
  it('promotes a deadline within 24 hours to now', () => {
    const urgency = resolveUrgency(
      {
        urgency: { level: 'later', score: 35, reason: 'Model estimate.' },
        task: { dueDate: '2026-08-28T10:00:00Z' },
      },
      now,
    );
    expect(urgency.level).toBe('now');
    expect(urgency.score).toBeGreaterThanOrEqual(90);
  });

  it('marks an event in the next several days as soon', () => {
    const urgency = resolveUrgency({ event: { startDateTime: '2026-08-31T09:00:00Z' } }, now);
    expect(urgency.level).toBe('soon');
  });

  it('preserves a model classification when no reliable date exists', () => {
    const urgency = resolveUrgency(
      { urgency: { level: 'reference', score: 12.4, reason: 'No time-sensitive action detected.' } },
      now,
    );
    expect(urgency).toEqual({ level: 'reference', score: 12, reason: 'No time-sensitive action detected.' });
  });
});
