'use client';

import { useId, useState } from 'react';
import { Check, ImageIcon, ImagePlus, Images, Trash2, X } from 'lucide-react';
import type { ExampleId } from '@/lib/fixtures';
import type { ScreenshotAnalysis } from '@/types/analysis';
import { SampleScreenshot } from '@/components/sample-screenshot';
import { VisualOverlay } from '@/components/visual-overlay';

export interface ScreenshotPreviewImage {
  previewUrl: string;
  fileName: string;
}

interface ScreenshotPreviewProps {
  images?: ScreenshotPreviewImage[];
  exampleId?: ExampleId;
  exampleCount?: number;
  exampleLabels?: string[];
  analysis?: ScreenshotAnalysis | null;
  isAnalyzing?: boolean;
  onAddFiles?: (files: File[]) => void;
  onRemove?: (index: number) => void;
  onClear?: () => void;
  onToast?: (message: string) => void;
}

export function ScreenshotPreview({
  images = [],
  exampleId,
  exampleCount = 1,
  exampleLabels = [],
  analysis,
  isAnalyzing = false,
  onAddFiles,
  onRemove,
  onClear,
  onToast,
}: ScreenshotPreviewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const inputId = useId();
  const count = exampleId ? exampleCount : images.length;
  const safeActiveIndex = Math.min(activeIndex, Math.max(0, count - 1));
  const activeImage = images[safeActiveIndex];

  return (
    <section className="screenshot-panel" aria-label={exampleId ? 'Example screenshots' : 'Uploaded screenshots'}>
      <div className="panel-heading">
        <span><ImageIcon size={15} /> {exampleId ? 'Example screenshots' : count === 1 ? 'Your screenshot' : 'Your screenshots'} {count > 1 && <small className="image-count-pill">{count}</small>}</span>
        {exampleId ? (
          <span className="example-pill">Example</span>
        ) : (
          <div className="gallery-actions">
            {onAddFiles && count < 5 && (
              <>
                <input
                  className="sr-only"
                  id={inputId}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    if (files.length) onAddFiles(files);
                    event.target.value = '';
                  }}
                />
                <label className="panel-action" htmlFor={inputId}><ImagePlus size={13} /> Add</label>
              </>
            )}
            {onClear && <button className="panel-action" type="button" onClick={onClear}><Trash2 size={12} /> Clear</button>}
          </div>
        )}
      </div>

      {(count > 1 || onRemove) && (
        <div className="screenshot-thumbnails" aria-label="Selected screenshot thumbnails">
          {Array.from({ length: count }, (_, index) => (
            <div className={`thumbnail-wrap ${safeActiveIndex === index ? 'is-active' : ''}`} key={exampleId ? `${exampleId}-${index}` : images[index]?.previewUrl}>
              <button className="screenshot-thumbnail" type="button" onClick={() => setActiveIndex(index)} aria-label={`View screenshot ${index + 1}`} aria-pressed={safeActiveIndex === index}>
                <span className="thumbnail-image">
                  {exampleId ? (
                    <ImageIcon size={16} />
                  ) : (
                    // Object URLs are created locally from the selected files.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={images[index]?.previewUrl} alt="" />
                  )}
                  <i>{index + 1}</i>
                </span>
                <small>{exampleId ? (exampleLabels[index] ?? `Image ${index + 1}`) : images[index]?.fileName}</small>
              </button>
              {!exampleId && onRemove && (
                <button className="remove-thumbnail" type="button" onClick={() => onRemove(index)} aria-label={`Remove ${images[index]?.fileName ?? `screenshot ${index + 1}`}`}><X size={12} /></button>
              )}
            </div>
          ))}
        </div>
      )}

      {!exampleId && count > 0 && (
        <div className="screenshot-ready-strip">
          <span><Check size={13} /> {count} screenshot{count === 1 ? '' : 's'} ready</span>
          <small><Images size={12} /> {count === 1 ? activeImage?.fileName : 'Analyzed together'}</small>
        </div>
      )}

      <div className={`screenshot-stage ${isAnalyzing ? 'is-scanning' : ''}`}>
        <div className="visual-image-frame">
          {exampleId ? (
            <SampleScreenshot id={exampleId} imageIndex={safeActiveIndex} />
          ) : (
            // The source is a local object URL created from the user's selected file.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activeImage?.previewUrl} alt={activeImage?.fileName || 'Screenshot selected for analysis'} />
          )}
          {isAnalyzing && <span className="screenshot-scan-beam" aria-hidden="true" />}
          {analysis && <VisualOverlay entities={analysis.visualEntities} sourceImageIndex={safeActiveIndex} onToast={onToast} />}
        </div>
      </div>
    </section>
  );
}
