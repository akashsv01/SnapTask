export type UrgencyLevel = 'now' | 'soon' | 'later' | 'reference';

export interface UrgencyData {
  level: UrgencyLevel;
  score: number;
  reason: string;
}

interface DatedTask {
  dueDate?: string | null;
  source?: 'explicit' | 'suggested';
}

interface UrgencyContext {
  urgency?: UrgencyData | null;
  task?: { dueDate?: string | null } | null;
  event?: { startDateTime?: string | null } | null;
  plan?: DatedTask[];
  thread?: { timeline?: Array<{ dateTime?: string | null }> } | null;
}

const DAY = 24 * 60 * 60 * 1_000;

function parseDate(value: string | null | undefined, endOfDay: boolean) {
  if (!value) return null;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const time = dateOnly
    ? Date.UTC(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3]),
        endOfDay ? 23 : 0,
        endOfDay ? 59 : 0,
        endOfDay ? 59 : 0,
      )
    : new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

function nearest(values: Array<number | null>, now: number) {
  const valid = values.filter((value): value is number => value !== null);
  if (valid.length === 0) return null;
  const future = valid.filter((value) => value >= now).sort((a, b) => a - b);
  return future[0] ?? Math.max(...valid);
}

function urgencyForDelta(delta: number, kind: 'deadline' | 'event'): UrgencyData {
  if (delta < 0) {
    return kind === 'deadline'
      ? { level: 'now', score: 100, reason: 'A stated deadline has passed and may need immediate attention.' }
      : { level: 'reference', score: 10, reason: 'The dated item appears to have already passed.' };
  }

  if (delta <= DAY) {
    return {
      level: 'now',
      score: 95,
      reason: kind === 'deadline' ? 'A stated deadline is within 24 hours.' : 'A dated event begins within 24 hours.',
    };
  }

  if (delta <= 7 * DAY) {
    const days = Math.max(2, Math.ceil(delta / DAY));
    return {
      level: 'soon',
      score: 75,
      reason: `${kind === 'deadline' ? 'A stated deadline' : 'A dated event'} is within ${days} days.`,
    };
  }

  return {
    level: 'later',
    score: 40,
    reason: kind === 'deadline' ? 'The next stated deadline is more than a week away.' : 'The next dated event is more than a week away.',
  };
}

function sanitizeModelUrgency(value: UrgencyData): UrgencyData {
  return { ...value, score: Math.round(Math.max(0, Math.min(100, value.score))) };
}

export function resolveUrgency(context: UrgencyContext, now = new Date()): UrgencyData {
  const nowTime = now.getTime();
  const deadline = nearest(
    [
      parseDate(context.task?.dueDate, true),
      ...(context.plan ?? [])
        .filter((item) => item.source === 'explicit')
        .map((item) => parseDate(item.dueDate, true)),
    ],
    nowTime,
  );

  if (deadline !== null) return urgencyForDelta(deadline - nowTime, 'deadline');

  const eventTime = nearest(
    [
      parseDate(context.event?.startDateTime, false),
      ...(context.thread?.timeline ?? []).map((item) => parseDate(item.dateTime, false)),
    ],
    nowTime,
  );

  if (eventTime !== null) return urgencyForDelta(eventTime - nowTime, 'event');
  if (context.urgency) return sanitizeModelUrgency(context.urgency);

  return { level: 'reference', score: 0, reason: 'No time-sensitive action was detected.' };
}
