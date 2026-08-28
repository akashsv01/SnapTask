'use client';

import { useEffect, useState } from 'react';
import { Check, ScanSearch, Sparkles } from 'lucide-react';

export function LoadingState({ imageCount = 1 }: { imageCount?: number }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = [
    `Reading your screenshot${imageCount === 1 ? '' : 's'}…`,
    imageCount === 1 ? 'Finding the important details…' : 'Connecting the details…',
    'Figuring out what needs action…',
  ];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % 3);
    }, 1_150);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="loading-card" aria-live="polite" aria-busy="true">
      <div className="scan-visual">
        <span className="scan-icon"><ScanSearch size={30} /></span>
        <span className="scan-line" />
        <span className="spark spark-one"><Sparkles size={14} /></span>
        <span className="spark spark-two"><Sparkles size={10} /></span>
      </div>
      <p className="loading-kicker">SnapTask is looking</p>
      <h2 key={messageIndex}>{messages[messageIndex]}</h2>
      <p>Turning pixels into a clear next step.</p>
      <div className="loading-steps" aria-hidden="true">
        {messages.map((message, index) => (
          <span className={index < messageIndex ? 'is-done' : index === messageIndex ? 'is-active' : ''} key={message}>
            <i>{index < messageIndex ? <Check size={11} /> : index + 1}</i>
            {message.replace('…', '')}
          </span>
        ))}
      </div>
    </section>
  );
}
