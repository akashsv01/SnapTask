import { NextResponse } from 'next/server';
import {
  analyzeScreenshots,
  GeminiAuthenticationError,
  GeminiQuotaError,
  GeminiServiceError,
  InvalidModelOutputError,
  MissingApiKeyError,
  NoActionableContentError,
} from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 30 * 1024 * 1024;
export const MAX_SCREENSHOT_COUNT = 5;
const SUPPORTED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

function errorResponse(error: string, code: string, status: number) {
  return NextResponse.json({ error, code }, { status });
}

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return errorResponse('That upload could not be read. Please try a different screenshot.', 'INVALID_UPLOAD', 400);
  }

  const submittedImages = formData.getAll('images');
  const legacyImage = formData.get('image');
  const images = submittedImages.length > 0 ? submittedImages : legacyImage ? [legacyImage] : [];

  if (images.length === 0) {
    return errorResponse('Choose at least one screenshot to analyze first.', 'MISSING_FILE', 400);
  }

  if (images.length > MAX_SCREENSHOT_COUNT) {
    return errorResponse(`You can analyze up to ${MAX_SCREENSHOT_COUNT} screenshots at once.`, 'TOO_MANY_FILES', 400);
  }

  if (images.some((image) => !(image instanceof File))) {
    return errorResponse('One of the uploaded items is not a readable screenshot.', 'INVALID_UPLOAD', 400);
  }

  const files = images as File[];
  if (files.some((image) => !SUPPORTED_TYPES.has(image.type))) {
    return errorResponse('Please upload only PNG, JPG, JPEG, or WEBP screenshots.', 'UNSUPPORTED_TYPE', 415);
  }

  if (files.some((image) => image.size === 0)) {
    return errorResponse('One of the screenshots appears to be empty.', 'EMPTY_FILE', 400);
  }

  if (files.some((image) => image.size > MAX_FILE_SIZE)) {
    return errorResponse('Each screenshot must be 10 MB or smaller.', 'FILE_TOO_LARGE', 413);
  }

  if (files.reduce((total, image) => total + image.size, 0) > MAX_TOTAL_SIZE) {
    return errorResponse('Those screenshots exceed the 30 MB combined upload limit.', 'UPLOAD_TOO_LARGE', 413);
  }

  try {
    const encodedImages = await Promise.all(
      files.map(async (image) => ({
        data: Buffer.from(await image.arrayBuffer()).toString('base64'),
        mimeType: image.type,
      })),
    );
    const analysis = await analyzeScreenshots(encodedImages);
    return NextResponse.json({ analysis });
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return errorResponse(
        'SnapTask needs a Gemini API key before live screenshots can be analyzed. You can still try an example below.',
        'MISSING_API_KEY',
        503,
      );
    }

    if (error instanceof NoActionableContentError) {
      return errorResponse(
        'I couldn’t confidently find anything actionable in this screenshot. Try one with a date, message, appointment, bill, event, or other clear information.',
        'NO_ACTIONABLE_CONTENT',
        422,
      );
    }

    if (error instanceof GeminiAuthenticationError) {
      return errorResponse(
        'Gemini rejected the configured API key. Check GEMINI_API_KEY in .env.local and restart the development server.',
        'INVALID_API_KEY',
        503,
      );
    }

    if (error instanceof GeminiQuotaError) {
      return errorResponse(
        'The Gemini API quota is currently exhausted. Check the key’s quota or try again after it resets.',
        'GEMINI_QUOTA_EXHAUSTED',
        429,
      );
    }

    if (error instanceof InvalidModelOutputError) {
      return errorResponse(
        'I understood parts of the screenshot but couldn’t organize them reliably. Please try again.',
        'INVALID_AI_RESPONSE',
        502,
      );
    }

    if (error instanceof GeminiServiceError) {
      return errorResponse(
        'Gemini is temporarily unavailable. SnapTask tried a fallback model; please try again shortly.',
        'GEMINI_FAILURE',
        502,
      );
    }

    return errorResponse('Something went wrong while analyzing the screenshot. Please try again.', 'UNKNOWN_ERROR', 500);
  }
}
