import { AlertCircle, ArrowRight } from 'lucide-react';

interface ErrorNoticeProps {
  message: string;
  compact?: boolean;
  onReset?: () => void;
}

export function ErrorNotice({ message, compact = false, onReset }: ErrorNoticeProps) {
  return (
    <div className={`inline-error ${compact ? 'compact-error' : ''}`} role="alert">
      <span className="error-icon"><AlertCircle size={17} /></span>
      <div><strong>That one didn&apos;t sort cleanly.</strong><p>{message}</p></div>
      {onReset && <button type="button" onClick={onReset}>Try another <ArrowRight size={13} /></button>}
    </div>
  );
}
