'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, LockKeyhole, Sparkles, Upload } from 'lucide-react';
import { validateScreenshotFile } from '@/lib/utils';

interface UploadZoneProps {
  onFiles: (files: File[]) => void;
  onError: (message: string) => void;
  onPasted: () => void;
}

export function UploadZone({ onFiles, onError, onPasted }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);

  function acceptFiles(files: File[]) {
    if (files.length > 5) {
      onError('Choose up to 5 screenshots at a time.');
      return;
    }
    const error = files.map((file) => validateScreenshotFile(file)).find(Boolean);
    if (error) {
      onError(error);
      return;
    }
    if (files.length) onFiles(files);
  }

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const image = Array.from(event.clipboardData?.items ?? []).find((item) => item.type.startsWith('image/'));
      const blob = image?.getAsFile();
      if (!blob) return;
      event.preventDefault();
      const extension = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
      acceptFiles([new File([blob], `pasted-screenshot.${extension}`, { type: blob.type })]);
      onPasted();
    }

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  });

  return (
    <div
      className={`upload-zone ${isDragging ? 'is-dragging' : ''}`}
      onDragEnter={(event) => {
        event.preventDefault();
        dragDepth.current += 1;
        setIsDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        event.preventDefault();
        dragDepth.current -= 1;
        if (dragDepth.current <= 0) {
          dragDepth.current = 0;
          setIsDragging(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        dragDepth.current = 0;
        setIsDragging(false);
        acceptFiles(Array.from(event.dataTransfer.files));
      }}
    >
      <input
        className="sr-only"
        id="screenshot-upload"
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
        onChange={(event) => {
          acceptFiles(Array.from(event.target.files ?? []));
          event.target.value = '';
        }}
      />
      <label className="upload-label" htmlFor="screenshot-upload">
        <span className="upload-icon"><Upload size={27} strokeWidth={1.8} /><i><Sparkles size={11} /></i></span>
        <span className="upload-title">{isDragging ? 'Drop to turn this into action' : 'Drop screenshots here'}</span>
        <span className="upload-subtitle">Upload one screenshot or a few that belong together.</span>
        <span className="upload-button"><ImagePlus size={17} /> Choose screenshots</span>
        <span className="upload-limit">PNG, JPG or WEBP · up to 5 screenshots</span>
      </label>

      <div className="upload-meta">
        <span><kbd>Ctrl</kbd> <span>+</span> <kbd>V</kbd> to paste</span>
        <span><LockKeyhole size={13} /> Not stored by SnapTask</span>
      </div>
    </div>
  );
}
