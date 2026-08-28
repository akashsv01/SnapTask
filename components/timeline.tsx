import { Building2, CalendarDays, Clock3, Images, Plane } from 'lucide-react';
import type { ScreenshotThread } from '@/lib/schema';

function formatTimelineTime(value: string | null) {
  if (!value) return 'Time not specified';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function TimelineIcon({ label }: { label: string }) {
  const normalized = label.toLowerCase();
  if (normalized.includes('flight') || normalized.includes('depart')) return <Plane size={12} />;
  if (normalized.includes('hotel') || normalized.includes('check-in')) return <Building2 size={12} />;
  return <CalendarDays size={12} />;
}

export function ScreenshotThreadCard({ thread }: { thread: ScreenshotThread }) {
  return (
    <section className="result-card thread-card">
      <div className="card-title-row"><span><Images size={14} /> Connected screenshots</span></div>
      <h3>{thread.relationship}</h3>
      <p>{thread.combinedSummary}</p>

      {!thread.isRelated && thread.imageSummaries.length > 0 && (
        <div className="image-summary-list">
          {thread.imageSummaries.map((item) => (
            <article key={item.sourceImageIndex}>
              <small>Screenshot {item.sourceImageIndex + 1}</small>
              <strong>{item.title}</strong>
              <p>{item.whatMatters}</p>
            </article>
          ))}
        </div>
      )}

      {thread.timeline.length > 0 && (
        <div className="timeline-section">
          <div className="card-title-row"><span><Clock3 size={14} /> Your timeline</span></div>
          <ol className="timeline-list">
            {thread.timeline.map((item, index) => (
              <li key={`${item.sourceImageIndex}-${item.label}-${index}`}>
                <span className="timeline-node"><TimelineIcon label={item.label} /></span>
                <div>
                  <time>{formatTimelineTime(item.dateTime)}</time>
                  <strong>{item.label}</strong>
                  <p>{item.description}</p>
                  <small>Screenshot {item.sourceImageIndex + 1}</small>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
