import type { ScreenshotAnalysis } from '@/types/analysis';

export const MAX_SCREENSHOT_SIZE = 10 * 1024 * 1024;
export const MAX_SCREENSHOT_COUNT = 5;
export const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

export function validateScreenshotFile(file: File): string | null {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type as (typeof SUPPORTED_IMAGE_TYPES)[number])) {
    return 'Please choose a PNG, JPG, JPEG, or WEBP screenshot.';
  }
  if (file.size === 0) return 'That screenshot appears to be empty.';
  if (file.size > MAX_SCREENSHOT_SIZE) return 'That screenshot is larger than 10 MB. Try a smaller image.';
  return null;
}

export function safeExternalUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function mapsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export function slugifyFileName(value: string) {
  return (
    value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 64) || 'snaptask-event'
  );
}

export function formatDueDate(value: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]), 12)
    : new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  const hasTime = !dateOnly && /T\d{2}:\d{2}/.test(value);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...(hasTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(date);
}

export function formatTask(analysis: ScreenshotAnalysis) {
  if (!analysis.task) return '';
  const lines = [analysis.task.title];
  if (analysis.task.dueDate) lines.push(`Due: ${formatDueDate(analysis.task.dueDate)}`);
  if (analysis.task.notes) lines.push(`Notes: ${analysis.task.notes}`);
  return lines.join('\n');
}

export async function compressImageForUpload(file: File): Promise<File> {
  const TARGET_SIZE = 4 * 1024 * 1024;
  if (file.size <= TARGET_SIZE || typeof createImageBitmap === 'undefined') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const maxDimension = 2_400;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.84));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' });
  } catch {
    return file;
  }
}
