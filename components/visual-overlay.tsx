'use client';

import { ArrowUpRight, CalendarPlus, Copy, ExternalLink, ListTodo, MapPin } from 'lucide-react';
import { mapsUrl, safeExternalUrl } from '@/lib/utils';
import type { VisualEntity } from '@/lib/schema';

interface VisualOverlayProps {
  entities: VisualEntity[];
  sourceImageIndex: number;
  onToast?: (message: string) => void;
}

const actionIcons = {
  calendar: CalendarPlus,
  maps: MapPin,
  task: ListTodo,
  open_link: ExternalLink,
  copy: Copy,
};

const actionLabels = {
  calendar: 'Add to calendar',
  maps: 'Open Maps',
  task: 'Create task',
  open_link: 'Open link',
  copy: 'Copy detail',
};

async function copyLabel(value: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
  throw new Error('Clipboard unavailable');
}

export function VisualOverlay({ entities, sourceImageIndex, onToast }: VisualOverlayProps) {
  const visible = entities.filter((entity) => entity.sourceImageIndex === sourceImageIndex);
  if (visible.length === 0) return null;

  async function act(entity: VisualEntity) {
    if (entity.action === 'maps') {
      window.open(mapsUrl(entity.label), '_blank', 'noopener,noreferrer');
      return;
    }
    if (entity.action === 'open_link') {
      const url = safeExternalUrl(entity.label);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      else onToast?.('That link could not be opened safely');
      return;
    }
    if (entity.action === 'calendar' || entity.action === 'task') {
      document.getElementById('next-actions')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      onToast?.(entity.action === 'calendar' ? 'Calendar action is ready below' : 'Task actions are ready below');
      return;
    }
    try {
      await copyLabel(entity.label);
      onToast?.(`${entity.type === 'phone' ? 'Phone number' : 'Detail'} copied`);
    } catch {
      onToast?.('Copy wasn’t available');
    }
  }

  return (
    <div className="visual-overlay" aria-label="Actionable regions found in screenshot">
      {visible.map((entity, index) => {
        const style = {
          left: `${entity.box.x * 100}%`,
          top: `${entity.box.y * 100}%`,
          width: `${entity.box.width * 100}%`,
          height: `${entity.box.height * 100}%`,
        };
        if (!entity.action) {
          return <span className={`visual-highlight visual-${entity.type}`} style={style} title={entity.label} key={`${entity.type}-${entity.label}-${index}`}><small className="visual-entity-tag">{entity.type}</small></span>;
        }
        const Icon = actionIcons[entity.action];
        return (
          <button
            className={`visual-highlight visual-${entity.type}`}
            style={style}
            type="button"
            title={`${entity.label} — click to act`}
            aria-label={`${entity.label}. ${entity.action.replace('_', ' ')} action.`}
            onClick={() => act(entity)}
            key={`${entity.type}-${entity.label}-${index}`}
          >
            <small className="visual-entity-tag">{entity.type}</small>
            <span className="visual-tooltip"><strong><Icon size={11} /> {entity.label}</strong><small>{actionLabels[entity.action]} <ArrowUpRight size={10} /></small></span>
          </button>
        );
      })}
    </div>
  );
}
