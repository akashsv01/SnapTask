'use client';

import { useState } from 'react';
import { Check, CheckCircle2, ChevronDown, Circle, Copy, ListChecks } from 'lucide-react';
import { formatDueDate } from '@/lib/utils';
import type { PlanItem } from '@/lib/schema';

interface ActionPlanProps {
  plan: PlanItem[];
  onToast: (message: string) => void;
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
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

function planText(plan: PlanItem[]) {
  return plan.map((item) => {
    const due = item.dueDate ? ` — Due ${formatDueDate(item.dueDate)}` : '';
    return `[${item.source === 'explicit' ? 'Required' : 'Suggested'}] ${item.task}${due}`;
  }).join('\n');
}

export function ActionPlan({ plan, onToast }: ActionPlanProps) {
  const [expanded, setExpanded] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(() => new Set());

  if (plan.length === 0) return null;

  async function copy(value: string, message: string) {
    try {
      await copyText(value);
      onToast(message);
    } catch {
      onToast('Copy wasn’t available — try selecting the text instead');
    }
  }

  function toggleComplete(index: number) {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <section className={`result-card plan-card ${expanded ? 'is-expanded' : ''}`}>
      <button className="plan-toggle" type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
        <span><span className="plan-toggle-icon"><ListChecks size={18} /></span><span><small>Action checklist</small>{expanded ? 'Your plan' : 'Turn this into a plan'}</span></span>
        <span className="plan-count">{plan.length} steps <ChevronDown size={16} /></span>
      </button>

      {expanded && (
        <div className="plan-content">
          <div className="plan-legend"><span><Check size={12} /> Required</span><span><Circle size={11} /> Suggested</span></div>
          <ul className="plan-list">
            {plan.map((item, index) => {
              const done = completed.has(index);
              return (
                <li className={`${done ? 'is-complete' : ''} plan-${item.source}`} key={`${item.task}-${index}`}>
                  <button className="plan-check" type="button" onClick={() => toggleComplete(index)} aria-label={`${done ? 'Mark incomplete' : 'Mark complete'}: ${item.task}`}>
                    {done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                  <div>
                    <span className="plan-meta"><small>{item.source === 'explicit' ? 'Required' : 'Suggested'}</small><small>{item.priority} priority</small></span>
                    <strong>{item.task}</strong>
                    {item.dueDate && <time>Due {formatDueDate(item.dueDate)}</time>}
                  </div>
                  <button className="plan-copy" type="button" onClick={() => copy(planText([item]), 'Task copied')} aria-label={`Copy ${item.task}`}><Copy size={14} /></button>
                </li>
              );
            })}
          </ul>
          <button className="copy-plan-button" type="button" onClick={() => copy(planText(plan), 'Plan copied')}><Copy size={14} /> Copy entire plan</button>
        </div>
      )}
    </section>
  );
}
