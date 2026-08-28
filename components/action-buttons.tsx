'use client';

import {
  CalendarPlus,
  Clipboard,
  ExternalLink,
  Mail,
  MapPin,
  Navigation,
  Phone,
} from 'lucide-react';
import { canCreateIcs, createIcs, type CalendarEventData } from '@/lib/ics';
import { formatTask, mapsUrl, safeExternalUrl, slugifyFileName } from '@/lib/utils';
import type { ScreenshotAnalysis } from '@/types/analysis';

interface ActionButtonsProps {
  analysis: ScreenshotAnalysis;
  onToast: (message: string) => void;
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('Copy failed');
}

export function ActionButtons({ analysis, onToast }: ActionButtonsProps) {
  const location = analysis.event?.location ?? analysis.entities.locations[0];
  const firstUrl = analysis.entities.urls.map(safeExternalUrl).find(Boolean);
  const email = analysis.entities.emails[0];
  const phone = analysis.entities.phoneNumbers[0];

  const calendarEvent: CalendarEventData | null =
    analysis.canCreateCalendarEvent && analysis.event?.title && analysis.event.startDateTime
      ? {
          title: analysis.event.title,
          startDateTime: analysis.event.startDateTime,
          endDateTime: analysis.event.endDateTime,
          allDay: analysis.event.allDay,
          location: analysis.event.location,
          description: analysis.event.description,
        }
      : null;

  const hasCalendarAction = canCreateIcs(calendarEvent);

  async function handleCopy(value: string, message: string) {
    try {
      await copyText(value);
      onToast(message);
    } catch {
      onToast('Copy wasn’t available — try selecting the text instead');
    }
  }

  function downloadCalendar() {
    if (!calendarEvent) return;
    const contents = createIcs(calendarEvent);
    const url = URL.createObjectURL(new Blob([contents], { type: 'text/calendar;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${slugifyFileName(calendarEvent.title)}.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    onToast('Calendar file downloaded');
  }

  const hasAnyAction =
    hasCalendarAction ||
    Boolean(analysis.canCreateTask && analysis.task) ||
    Boolean(location || firstUrl || email || phone);

  if (!hasAnyAction) return null;

  return (
    <div className="action-grid">
      {hasCalendarAction && (
        <button className="action-button primary-action" type="button" onClick={downloadCalendar}>
          <CalendarPlus size={17} />
          <span>Add to calendar<small>Download .ics</small></span>
        </button>
      )}

      {analysis.canCreateTask && analysis.task && (
        <button
          className={`action-button ${!hasCalendarAction ? 'primary-action' : ''}`}
          type="button"
          onClick={() => handleCopy(formatTask(analysis), 'Task copied')}
        >
          <Clipboard size={17} />
          <span>Copy task<small>Ready to paste</small></span>
        </button>
      )}

      {location && (
        <a className="action-button" href={mapsUrl(location)} target="_blank" rel="noopener noreferrer">
          <Navigation size={17} />
          <span>Open in Maps<small>Google Maps</small></span>
        </a>
      )}

      {location && (
        <button className="action-button compact-action" type="button" onClick={() => handleCopy(location, 'Location copied')}>
          <MapPin size={16} /> Copy location
        </button>
      )}

      {firstUrl && (
        <a className="action-button compact-action" href={firstUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={16} /> Open link
        </a>
      )}

      {email && (
        <button className="action-button compact-action" type="button" onClick={() => handleCopy(email, 'Email copied')}>
          <Mail size={16} /> Copy email
        </button>
      )}

      {phone && (
        <button className="action-button compact-action" type="button" onClick={() => handleCopy(phone, 'Phone number copied')}>
          <Phone size={16} /> Copy phone
        </button>
      )}
    </div>
  );
}
