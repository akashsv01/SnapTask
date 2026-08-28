'use client';

import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  BookOpen,
  CalendarDays,
  Clock3,
  CookingPot,
  FileText,
  GraduationCap,
  Link2,
  Mail,
  MapPin,
  MessageSquareText,
  Plane,
  ReceiptText,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Tag,
  Ticket,
} from 'lucide-react';
import { ActionButtons } from '@/components/action-buttons';
import { ActionPlan } from '@/components/action-plan';
import { ScreenshotThreadCard } from '@/components/timeline';
import { UrgencyBadge } from '@/components/urgency-badge';
import { WhySavedCard } from '@/components/why-saved-card';
import { mapsUrl, safeExternalUrl } from '@/lib/utils';
import type { ContentType, ScreenshotAnalysis } from '@/types/analysis';

interface AnalysisResultProps {
  analysis: ScreenshotAnalysis;
  isExample: boolean;
  imageCount: number;
  onToast: (message: string) => void;
}

const typeConfig: Record<ContentType, { label: string; icon: LucideIcon }> = {
  event: { label: 'Event', icon: CalendarDays },
  bill: { label: 'Bill', icon: ReceiptText },
  appointment: { label: 'Appointment', icon: Stethoscope },
  travel: { label: 'Travel', icon: Plane },
  email: { label: 'Email', icon: Mail },
  message: { label: 'Message', icon: MessageSquareText },
  product: { label: 'Product', icon: ShoppingBag },
  recipe: { label: 'Recipe', icon: CookingPot },
  class: { label: 'Class', icon: GraduationCap },
  ticket: { label: 'Ticket', icon: Ticket },
  reservation: { label: 'Reservation', icon: BookOpen },
  document: { label: 'Document', icon: FileText },
  other: { label: 'Screenshot', icon: Sparkles },
};

const entityConfig: Array<{
  key: keyof ScreenshotAnalysis['entities'];
  label: string;
  icon: LucideIcon;
}> = [
  { key: 'dates', label: 'Dates', icon: CalendarDays },
  { key: 'times', label: 'Times', icon: Clock3 },
  { key: 'locations', label: 'Locations', icon: MapPin },
  { key: 'urls', label: 'Links', icon: Link2 },
  { key: 'emails', label: 'Emails', icon: Mail },
  { key: 'phoneNumbers', label: 'Phone', icon: MessageSquareText },
  { key: 'amounts', label: 'Amounts', icon: Banknote },
];

function DetailIcon({ label }: { label: string }) {
  const lower = label.toLowerCase();
  if (lower.includes('date') || lower.includes('deadline')) return <CalendarDays size={16} />;
  if (lower.includes('time') || lower.includes('check-in') || lower.includes('boarding')) return <Clock3 size={16} />;
  if (lower.includes('location') || lower.includes('city') || lower.includes('gate')) return <MapPin size={16} />;
  if (lower.includes('amount') || lower.includes('price')) return <Banknote size={16} />;
  return <Tag size={16} />;
}

function EntityValue({ category, value }: { category: keyof ScreenshotAnalysis['entities']; value: string }) {
  if (category === 'urls') {
    const url = safeExternalUrl(value);
    return url ? <a href={url} target="_blank" rel="noopener noreferrer">{value}</a> : <span>{value}</span>;
  }
  if (category === 'emails') return <a href={`mailto:${encodeURIComponent(value)}`}>{value}</a>;
  if (category === 'phoneNumbers') return <a href={`tel:${encodeURIComponent(value)}`}>{value}</a>;
  if (category === 'locations') {
    return <a href={mapsUrl(value)} target="_blank" rel="noopener noreferrer">{value}</a>;
  }
  return <span>{value}</span>;
}

export function AnalysisResult({ analysis, isExample, imageCount, onToast }: AnalysisResultProps) {
  const config = typeConfig[analysis.contentType];
  const TypeIcon = config.icon;
  const visibleEntities = entityConfig.filter(({ key }) => analysis.entities[key].length > 0);
  const hasAction = Boolean(
    analysis.suggestedAction ||
      analysis.canCreateCalendarEvent ||
      analysis.canCreateTask ||
      analysis.event?.location ||
      analysis.entities.locations.length ||
      analysis.entities.urls.length ||
      analysis.entities.emails.length ||
      analysis.entities.phoneNumbers.length,
  );

  return (
    <section className="analysis-result">
      <div className="result-heading">
        <div className="result-topline">
          <span className={`type-badge type-${analysis.contentType}`}><TypeIcon size={14} /> {config.label}</span>
          <div className="result-statuses">
            <UrgencyBadge urgency={analysis.urgency} />
            {isExample && <span className="example-result-label">Example result</span>}
          </div>
        </div>

        <h2 className="result-title">{analysis.title}</h2>
        <p className="result-summary">{analysis.summary}</p>
      </div>

      <div className="what-matters-card">
        <span><Sparkles size={15} /> What matters</span>
        <p>{analysis.thread?.combinedWhatMatters ?? analysis.whatMatters}</p>
      </div>

      <WhySavedCard whySaved={analysis.whySaved} imageCount={imageCount} />

      {analysis.thread?.isMultiImage && <ScreenshotThreadCard thread={analysis.thread} />}

      {hasAction && (
        <section className="result-card next-action-card" id="next-actions">
          <div className="card-title-row"><span><ArrowUpRight size={14} /> Next action</span></div>
          <h3>{analysis.suggestedAction?.label ?? 'Useful next steps'}</h3>
          <p>{analysis.suggestedAction?.reason ?? 'Use the actions that match the details found in this screenshot.'}</p>
          <ActionButtons analysis={analysis} onToast={onToast} />
        </section>
      )}

      <ActionPlan plan={analysis.plan} onToast={onToast} />

      {analysis.keyDetails.length > 0 && (
        <section className="result-card">
          <div className="card-title-row"><span>Key details</span><small>{analysis.keyDetails.length} found</small></div>
          <div className="details-grid">
            {analysis.keyDetails.map((detail) => (
              <div className="detail-item" key={`${detail.label}-${detail.value}`}>
                <span className="detail-icon"><DetailIcon label={detail.label} /></span>
                <div><small>{detail.label}</small><strong>{detail.value}</strong></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {analysis.warnings.length > 0 && (
        <div className="warning-box">
          <AlertTriangle size={17} />
          <div>{analysis.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>
        </div>
      )}

      {visibleEntities.length > 0 && (
        <section className="entities-section">
          <div className="card-title-row"><span>Found in screenshot</span></div>
          <div className="entity-groups">
            {visibleEntities.map(({ key, label, icon: Icon }) => (
              <div className="entity-group" key={key}>
                <span className="entity-label"><Icon size={14} /> {label}</span>
                <div className="entity-values">
                  {analysis.entities[key].map((value) => (
                    <EntityValue category={key} key={value} value={value} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="confidence-note"><ShieldCheck size={12} />
        {analysis.confidence >= 0.85 ? 'High-confidence read' : analysis.confidence >= 0.6 ? 'Likely read' : 'Some details may be unclear'}
        {' · '}Always verify important dates and amounts.
      </p>
    </section>
  );
}
