'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, CalendarDays, MessageSquareText, Plane, ReceiptText, Sparkles } from 'lucide-react';
import type { ExampleId } from '@/lib/fixtures';

interface ExamplePickerProps {
  onSelect: (id: ExampleId) => void;
}

const examples: Array<{ id: ExampleId; label: string; detail: string; icon: LucideIcon; featured?: boolean }> = [
  { id: 'event', label: 'Event', detail: 'Conference tomorrow', icon: CalendarDays },
  { id: 'bill', label: 'Bill', detail: '$82.17 due', icon: ReceiptText },
  { id: 'message', label: 'Message', detail: 'Send deck Friday', icon: MessageSquareText },
  { id: 'trip', label: 'Trip', detail: '3 connected screenshots', icon: Plane, featured: true },
];

export function ExamplePicker({ onSelect }: ExamplePickerProps) {
  return (
    <section className="example-picker" aria-labelledby="example-picker-title">
      <div className="example-picker-heading">
        <span><Sparkles size={13} /> No screenshot handy?</span>
        <p id="example-picker-title">Try one of these examples.</p>
      </div>
      <div className="example-cards" aria-label="Example screenshots">
        {examples.map(({ id, label, detail, icon: Icon, featured }) => (
          <button className={`example-card ${featured ? 'is-featured' : ''}`} type="button" key={id} onClick={() => onSelect(id)}>
            <span className="example-card-icon"><Icon size={17} /></span>
            <span><strong>{label}</strong><small>{detail}</small></span>
            <ArrowUpRight className="example-arrow" size={14} />
          </button>
        ))}
      </div>
    </section>
  );
}
