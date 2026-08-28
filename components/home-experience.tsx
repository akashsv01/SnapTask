import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  Eye,
  MapPin,
  MessageSquareText,
  Plane,
  ReceiptText,
  ScanLine,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';

export function HeroIntentCards() {
  return (
    <div className="hero-intent-cards" aria-hidden="true">
      <article className="intent-card intent-flight">
        <span className="intent-source"><Plane size={13} /> Flight confirmation</span>
        <span className="intent-connector"><ArrowRight size={12} /></span>
        <strong><Clock3 size={14} /> Boards at 6:35 AM</strong>
      </article>
      <article className="intent-card intent-message">
        <span className="intent-source"><MessageSquareText size={13} /> Message</span>
        <span className="intent-connector"><ArrowRight size={12} /></span>
        <strong><CheckCircle2 size={14} /> Send deck by Friday</strong>
      </article>
      <article className="intent-card intent-bill">
        <span className="intent-source"><ReceiptText size={13} /> Utility bill</span>
        <span className="intent-connector"><ArrowRight size={12} /></span>
        <strong><Zap size={14} /> $82.17 due Sept 4</strong>
      </article>
    </div>
  );
}

const storySteps = [
  {
    number: '01',
    icon: Eye,
    title: 'Understand',
    text: 'SnapTask reads the details that matter.',
    visual: <span className="story-detail"><ScanLine size={13} /> August 28 · 9:30 AM · Arlington</span>,
  },
  {
    number: '02',
    icon: Target,
    title: 'Decide',
    text: 'It figures out what actually needs your attention.',
    visual: <span className="story-priority"><i /> Priority: Soon</span>,
  },
  {
    number: '03',
    icon: Zap,
    title: 'Act',
    text: 'Turn the screenshot into a calendar event, task, map, or plan.',
    visual: <span className="story-action"><CalendarPlus size={14} /> Add to calendar</span>,
  },
] as const;

export function ProductStory() {
  return (
    <section className="story-section shell" aria-labelledby="story-title">
      <div className="section-heading">
        <span>From image to intention</span>
        <h2 id="story-title">The work after the screenshot, handled.</h2>
        <p>SnapTask moves one forgotten image through three clear stages.</p>
      </div>
      <div className="story-grid">
        {storySteps.map(({ number, icon: Icon, title, text, visual }) => (
          <article className="story-card" key={title}>
            <div className="story-card-top"><span className="story-icon"><Icon size={19} /></span><small>{number}</small></div>
            <h3>{title}</h3>
            <p>{text}</p>
            <div className="story-micro">{visual}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function BeforeAfter() {
  return (
    <section className="before-after shell" aria-labelledby="before-after-title">
      <div className="section-heading compact-heading">
        <span>Before → after</span>
        <h2 id="before-after-title">From screenshot clutter to clear action.</h2>
      </div>

      <div className="transformation-stage">
        <article className="before-card" aria-label="Example event screenshot">
          <div className="mock-toolbar"><i /><i /><i /></div>
          <span className="mock-kicker">DEVFEST DC</span>
          <strong>Build what&apos;s next.</strong>
          <div className="mock-flyer-grid">
            <span>FRI<br /><b>AUG 28</b></span>
            <span>CHECK-IN<br /><b>9:30 AM</b></span>
          </div>
          <p>Fuse at Mason Square<br />Arlington, Virginia</p>
        </article>

        <div className="transform-bridge" aria-hidden="true">
          <span><Sparkles size={17} /></span>
          <i />
          <ArrowRight size={18} />
        </div>

        <article className="after-card">
          <div className="after-card-top"><span><Sparkles size={13} /> What matters</span><small>Soon</small></div>
          <blockquote>Arrive at 9:30 AM at Fuse at Mason Square.</blockquote>
          <div className="after-details"><span><Clock3 size={13} /> Fri, Aug 28</span><span><MapPin size={13} /> Arlington</span></div>
          <div className="after-actions" aria-hidden="true"><span><CalendarPlus size={14} /> Add to calendar</span><span><MapPin size={14} /> Open Maps</span></div>
        </article>
      </div>
    </section>
  );
}
