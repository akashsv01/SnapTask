import type { ScreenshotAnalysis } from '@/types/analysis';

const labels = {
  now: 'Now',
  soon: 'Soon',
  later: 'Later',
  reference: 'Reference',
} as const;

export function UrgencyBadge({ urgency }: { urgency: ScreenshotAnalysis['urgency'] }) {
  if (!urgency) return null;
  return (
    <span
      className={`urgency-badge urgency-${urgency.level}`}
      title={`${urgency.reason} Urgency score: ${urgency.score}/100.`}
      aria-label={`${labels[urgency.level]} urgency. ${urgency.reason}`}
    >
      <i className="urgency-dot" aria-hidden="true" /> {labels[urgency.level]}
    </span>
  );
}
