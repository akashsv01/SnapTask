import { Bookmark, Sparkles } from 'lucide-react';
import type { ScreenshotAnalysis } from '@/types/analysis';

interface WhySavedCardProps {
  whySaved: ScreenshotAnalysis['whySaved'];
  imageCount: number;
}

export function WhySavedCard({ whySaved, imageCount }: WhySavedCardProps) {
  if (!whySaved || whySaved.confidence < 0.65) return null;

  return (
    <aside className="why-saved-card">
      <div className="why-saved-heading">
        <span><Bookmark size={15} /> Why you probably saved {imageCount > 1 ? 'these' : 'this'}</span>
        <small><Sparkles size={11} /> AI inference</small>
      </div>
      <p>{whySaved.reason}</p>
    </aside>
  );
}
