'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Code2, RefreshCw, Sparkles, Trophy } from 'lucide-react';
import { AnalysisResult } from '@/components/analysis-result';
import { ErrorNotice } from '@/components/error-notice';
import { ExamplePicker } from '@/components/example-picker';
import { BeforeAfter, HeroIntentCards, ProductStory } from '@/components/home-experience';
import { LoadingState } from '@/components/loading-state';
import { ScreenshotPreview } from '@/components/screenshot-preview';
import { UploadZone } from '@/components/upload-zone';
import { analysisSchema } from '@/lib/schema';
import { exampleFixtures, type ExampleId } from '@/lib/fixtures';
import { compressImageForUpload, MAX_SCREENSHOT_COUNT, validateScreenshotFile } from '@/lib/utils';
import type { ScreenshotAnalysis } from '@/types/analysis';

type Stage = 'idle' | 'preview' | 'analyzing' | 'result';

interface FileSelection {
  kind: 'file';
  files: Array<{
    id: string;
    file: File;
    previewUrl: string;
  }>;
}

interface ExampleSelection {
  kind: 'example';
  id: ExampleId;
}

type Selection = FileSelection | ExampleSelection;

export function SnapTaskApp() {
  const [stage, setStage] = useState<Stage>('idle');
  const [selection, setSelection] = useState<Selection | null>(null);
  const [analysis, setAnalysis] = useState<ScreenshotAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const previewUrls = useRef(new Set<string>());

  const isExample = selection?.kind === 'example';
  const selectedFiles = selection?.kind === 'file' ? selection.files : [];
  const imageCount = selection?.kind === 'example'
    ? exampleFixtures[selection.id].imageCount
    : selectedFiles.length;

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2_600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current.clear();
  }, []);

  function showToast(message: string) {
    setToast(message);
  }

  function releasePreview(url: string) {
    URL.revokeObjectURL(url);
    previewUrls.current.delete(url);
  }

  function handleFiles(files: File[]) {
    const validationError = files.map((file) => validateScreenshotFile(file)).find(Boolean);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (selectedFiles.length + files.length > MAX_SCREENSHOT_COUNT) {
      setError(`SnapTask can analyze up to ${MAX_SCREENSHOT_COUNT} screenshots at once.`);
      return;
    }

    const additions = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.add(previewUrl);
      return { id: `${file.name}-${file.size}-${file.lastModified}-${previewUrl}`, file, previewUrl };
    });

    setError(null);
    setAnalysis(null);
    setSelection({ kind: 'file', files: [...selectedFiles, ...additions] });
    setStage('preview');
  }

  function removeFile(index: number) {
    if (selection?.kind !== 'file') return;
    releasePreview(selection.files[index].previewUrl);
    const files = selection.files.filter((_, candidateIndex) => candidateIndex !== index);
    if (files.length === 0) {
      setSelection(null);
      setAnalysis(null);
      setError(null);
      setStage('idle');
      return;
    }
    setSelection({ kind: 'file', files });
  }

  function clearFiles() {
    if (selection?.kind === 'file') selection.files.forEach(({ previewUrl }) => releasePreview(previewUrl));
    setSelection(null);
    setAnalysis(null);
    setError(null);
    setStage('idle');
  }

  function handleExample(id: ExampleId) {
    setError(null);
    setSelection({ kind: 'example', id });
    setAnalysis(exampleFixtures[id].analysis);
    setStage('result');
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  }

  function reset() {
    if (selection?.kind === 'file') selection.files.forEach(({ previewUrl }) => releasePreview(previewUrl));
    setStage('idle');
    setSelection(null);
    setAnalysis(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function analyze() {
    if (selectedFiles.length === 0) return;
    setError(null);
    setStage('analyzing');

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 60_000);

    try {
      const uploadFiles = await Promise.all(selectedFiles.map(({ file }) => compressImageForUpload(file)));
      const body = new FormData();
      uploadFiles.forEach((file) => body.append('images', file));

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body,
        signal: controller.signal,
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
            ? payload.error
            : 'The screenshot couldn’t be analyzed. Please try again.';
        throw new Error(message);
      }

      const parsed = analysisSchema.safeParse(
        payload && typeof payload === 'object' && 'analysis' in payload ? payload.analysis : null,
      );
      if (!parsed.success) throw new Error('The result was incomplete. Please try the screenshot again.');

      setAnalysis(parsed.data);
      setStage('result');
    } catch (requestError) {
      setError(
        requestError instanceof DOMException && requestError.name === 'AbortError'
          ? 'Analysis took too long. Check your connection and try again, or open an example.'
          : requestError instanceof Error
            ? requestError.message
            : 'The screenshot couldn’t be analyzed. Please try again.',
      );
      setStage('preview');
    } finally {
      window.clearTimeout(timeout);
    }
  }

  return (
    <main id="top">
      <div className="nav-wrap">
        <nav className="nav shell" aria-label="Primary navigation">
          <button className="brand brand-button" type="button" onClick={reset} aria-label="SnapTask home">
            <span className="brand-mark"><Check size={16} strokeWidth={3} /></span>
            <span>SnapTask</span>
          </button>
          <div className="nav-actions">
            <span className="devfest-badge"><Trophy size={13} /> Built for DevFest DC</span>
            <a
              className="github-link"
              href="https://github.com/akashsv01/SnapTask"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Code2 size={16} /> <span>GitHub</span>
            </a>
          </div>
        </nav>
      </div>

      {stage === 'idle' ? (
        <>
          <section className="hero shell">
            <HeroIntentCards />
            <div className="hero-copy-block">
              <div className="eyebrow"><Sparkles size={14} /> AI for the things you saved for later</div>
              <h1>A screenshot is now <em>a task.</em></h1>
              <p className="hero-copy">Upload anything you meant to deal with later. SnapTask figures out what matters and gives you the next action.</p>
            </div>

            <UploadZone
              onFiles={handleFiles}
              onError={setError}
              onPasted={() => showToast('Screenshot pasted')}
            />

            {error && <ErrorNotice message={error} />}

            <ExamplePicker onSelect={handleExample} />
          </section>

          <ProductStory />
          <BeforeAfter />
        </>
      ) : (
        <section className="workspace shell">
          <div className="workspace-header">
            <button className="back-button" type="button" onClick={reset}><ArrowLeft size={16} /> Analyze another</button>
            <span>{stage === 'result' ? `${imageCount === 1 ? 'Your screenshot' : 'Your screenshots'}, sorted.` : `${imageCount} screenshot${imageCount === 1 ? '' : 's'} away from done.`}</span>
          </div>

          <div className="workspace-grid">
            <ScreenshotPreview
              images={selectedFiles.map(({ file, previewUrl }) => ({ previewUrl, fileName: file.name }))}
              exampleId={selection?.kind === 'example' ? selection.id : undefined}
              exampleCount={selection?.kind === 'example' ? exampleFixtures[selection.id].imageCount : undefined}
              exampleLabels={selection?.kind === 'example' ? exampleFixtures[selection.id].imageLabels : undefined}
              analysis={stage === 'result' ? analysis : null}
              isAnalyzing={stage === 'analyzing'}
              onAddFiles={selection?.kind === 'file' && stage === 'preview' ? handleFiles : undefined}
              onRemove={selection?.kind === 'file' && stage === 'preview' ? removeFile : undefined}
              onClear={selection?.kind === 'file' && stage === 'preview' ? clearFiles : undefined}
              onToast={showToast}
            />

            {stage === 'preview' && (
              <section className="ready-card">
                <span className="ready-icon"><Sparkles size={23} /></span>
                <p className="loading-kicker">Ready when you are</p>
                <h2>Turn {imageCount === 1 ? 'this' : 'these'} into action.</h2>
                <p>SnapTask will read {imageCount === 1 ? 'the screenshot' : 'the screenshots together'}, connect the useful details, and suggest a next step.</p>
                <div className="ready-capabilities" aria-hidden="true"><span>Understand</span><i /><span>Prioritize</span><i /><span>Act</span></div>
                {error && <ErrorNotice message={error} compact onReset={reset} />}
                <button className="analyze-button" type="button" onClick={analyze}>
                  <Sparkles size={16} /> Analyze {imageCount} screenshot{imageCount === 1 ? '' : 's'} <ArrowRight size={17} />
                </button>
                <small>Your {imageCount === 1 ? 'image is' : 'images are'} sent securely to Gemini for this analysis and are not persisted by SnapTask.</small>
              </section>
            )}

            {stage === 'analyzing' && <LoadingState imageCount={imageCount} />}

            {stage === 'result' && analysis && (
              <AnalysisResult analysis={analysis} isExample={isExample} imageCount={imageCount} onToast={showToast} />
            )}
          </div>

          {stage === 'result' && (
            <div className="result-footer-action">
              <button type="button" onClick={reset}><RefreshCw size={15} /> Analyze more screenshots</button>
            </div>
          )}
        </section>
      )}

      <footer className="footer shell">
        <div className="footer-brand"><span className="brand-mark footer-mark"><Check size={13} strokeWidth={3} /></span><div><strong>SnapTask</strong><p>Turn saved screenshots into next actions.</p></div></div>
        <div className="footer-meta"><span>Built for DevFest DC 2026</span><a href="https://github.com/akashsv01/SnapTask" target="_blank" rel="noopener noreferrer"><Code2 size={14} /> GitHub</a></div>
      </footer>

      {toast && <div className="toast" role="status"><Check size={16} /> {toast}</div>}
    </main>
  );
}
