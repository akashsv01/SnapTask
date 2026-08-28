import { GoogleGenAI } from '@google/genai';
import {
  analysisJsonSchema,
  hasUsefulInformation,
  parseAnalysisText,
  type ScreenshotAnalysis,
} from '@/lib/schema';

const DEFAULT_MODEL = 'gemini-3.6-flash';
const FALLBACK_MODELS = ['gemini-3.5-flash'] as const;
const REQUEST_TIMEOUT_MS = 25_000;
const RETRYABLE_STATUSES = new Set([400, 408, 429, 500, 502, 503, 504]);

const SYSTEM_INSTRUCTION = `You are an assistant that converts screenshots into useful real-world actions.

Analyze every provided screenshot carefully. A request may contain one screenshot or a thread of up to five screenshots.

Determine:
1. What type of screenshot this is
2. What the screenshot is about
3. The important facts
4. What the user most likely needs to do next
5. Any date, time, location, URL, phone number, email, amount, deadline, reservation information, confirmation number, or other actionable entity
6. Whether a calendar event can reasonably be created
7. Whether a todo/task can reasonably be created
8. If multiple screenshots are related, what combined story and timeline they form
9. Why the user probably saved the screenshot or screenshots
10. Which actions are explicit in the screenshots and which are merely useful suggestions
11. How urgently the information needs attention
12. Which visible regions contain actionable dates, times, locations, amounts, links, phone numbers, or deadlines

Never invent information that is not visible or strongly implied by the screenshot. If something is unclear, return null or an empty array instead of guessing. Do not turn a partial or ambiguous date into a calendar event. Preserve confirmation numbers, flight numbers, gates, amounts, and deadlines exactly as shown.

Prioritize usefulness over exhaustive extraction. Keep keyDetails short and ordered by importance.

whySaved is an inference, never a fact. Phrase it with uncertainty, such as “You probably saved this because…”, “You may have saved this to…”, or “This looks worth keeping because…”. When the likely intent is unclear, use confidence 0 so the interface can hide it.

Return no more than five concrete plan tasks. Use source “explicit” only when the screenshot directly asks for or requires the task. Use “suggested” for a reasonable inferred next step. Avoid generic tasks such as “review this information”. Prefer an empty plan over weak suggestions.

For urgency, use now for action within about 24 hours, soon for the next several days, later for more distant action, and reference when no action is time-sensitive. Dates will be checked deterministically by the server.

For multiple screenshots, thread.isMultiImage must be true. Decide whether they are related, summarize each image in imageSummaries, and always provide a useful combined summary. Use sourceImageIndex values starting at 0. If they are unrelated, say so plainly and keep each image summary distinct. For a single screenshot, return a thread object with isMultiImage false, isRelated false, relationship “Single screenshot”, combined fields matching the main analysis, and empty imageSummaries and timeline arrays.

visualEntities are optional visual enhancements. Return only high-confidence normalized bounding boxes using coordinates from 0 to 1 relative to the full source image. Keep each box inside the image. Be conservative: omit uncertain boxes rather than guessing. For multi-image input, assign the correct sourceImageIndex. An empty array is valid.

The whatMatters field must be a single sentence that answers: “What does the user actually need to know or do?”

Examples:
“You need to arrive at 9:30 AM and have your ticket QR code ready.”
“Your bill is due September 4 and the amount due is $82.17.”
“Your dentist appointment is Tuesday at 2:30 PM at Arlington Dental.”
“The application deadline is Friday at 11:59 PM.”

For event, task, plan, and timeline dates, use ISO 8601 when a complete date is clear. Include a timezone offset only when the screenshot provides or strongly establishes one. Use a floating local datetime such as 2026-08-28T09:30:00 when the local time is clear but the timezone is not. Set canCreateCalendarEvent to true only when the event title and full start date are reliable. Return only structured output matching the requested schema.`;

export class MissingApiKeyError extends Error {}
export class InvalidModelOutputError extends Error {}
export class NoActionableContentError extends Error {}
export class GeminiAuthenticationError extends Error {}
export class GeminiQuotaError extends Error {}
export class GeminiServiceError extends Error {}

function modelCandidates() {
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  return [...new Set([configuredModel || DEFAULT_MODEL, DEFAULT_MODEL, ...FALLBACK_MODELS])];
}

function apiErrorStatus(error: unknown): number | null {
  if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
    return error.status;
  }
  return null;
}

function apiErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '';
}

function isAuthenticationError(error: unknown) {
  const status = apiErrorStatus(error);
  return (
    status === 401 ||
    status === 403 ||
    /api key not valid|api_key_invalid|permission denied|request had invalid authentication/i.test(
      apiErrorMessage(error),
    )
  );
}

export interface ScreenshotInput {
  data: string;
  mimeType: string;
}

function alignAnalysisToImages(analysis: ScreenshotAnalysis, imageCount: number): ScreenshotAnalysis {
  const visualEntities = analysis.visualEntities.filter((entity) => entity.sourceImageIndex < imageCount);
  if (imageCount === 1) return { ...analysis, thread: null, visualEntities };

  const thread = analysis.thread
    ? {
        ...analysis.thread,
        isMultiImage: true,
        imageSummaries: analysis.thread.imageSummaries.filter((item) => item.sourceImageIndex < imageCount),
        timeline: analysis.thread.timeline.filter((item) => item.sourceImageIndex < imageCount),
      }
    : {
        isMultiImage: true,
        isRelated: false,
        relationship: 'These screenshots were analyzed together, but their relationship is not clear.',
        combinedSummary: analysis.summary,
        combinedWhatMatters: analysis.whatMatters,
        imageSummaries: [],
        timeline: [],
      };

  return { ...analysis, thread, visualEntities };
}

function screenshotContents(images: ScreenshotInput[]) {
  const parts: Array<{ text: string } | { inlineData: ScreenshotInput }> = [
    {
      text: `Analyze ${images.length === 1 ? 'this screenshot' : `these ${images.length} screenshots as one screenshot thread`}. Image indices in the structured response are zero-based.`,
    },
  ];

  images.forEach((image, index) => {
    parts.push({ text: `Screenshot ${index + 1} (sourceImageIndex ${index}):` });
    parts.push({ inlineData: image });
  });

  parts.push({
    text: `Today's date is ${new Date().toISOString().slice(0, 10)} UTC. Use today's date only to resolve explicitly relative dates such as “tomorrow” or “Friday”; do not use it to invent missing dates.`,
  });
  return parts;
}

export async function analyzeScreenshots(images: ScreenshotInput[]): Promise<ScreenshotAnalysis> {
  if (images.length === 0) throw new NoActionableContentError('No screenshots were provided.');
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new MissingApiKeyError('GEMINI_API_KEY is not configured.');

  const ai = new GoogleGenAI({ apiKey });

  try {
    let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null = null;
    let lastServiceError: unknown;
    let quotaWasExhausted = false;

    for (const model of modelCandidates()) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: screenshotContents(images),
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseJsonSchema: analysisJsonSchema,
            temperature: 0.1,
            maxOutputTokens: 8_192,
            httpOptions: {
              timeout: REQUEST_TIMEOUT_MS,
              // Fail over ourselves so a busy model cannot consume the entire request timeout.
              retryOptions: { attempts: 1 },
            },
          },
        });
        break;
      } catch (error) {
        if (isAuthenticationError(error)) {
          throw new GeminiAuthenticationError('Gemini rejected the configured API key.');
        }

        const status = apiErrorStatus(error);
        quotaWasExhausted ||= status === 429;
        lastServiceError = error;
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[SnapTask] Gemini model ${model} failed with ${status ?? 'a network/timeout error'}: ${apiErrorMessage(error).slice(0, 500)}`,
          );
        }

        // A model can be unavailable for an account (404), temporarily busy, or reject
        // a structured-output shape supported by another model generation (400).
        if (status === null || status === 404 || RETRYABLE_STATUSES.has(status)) continue;
        throw error;
      }
    }

    if (!response) {
      if (quotaWasExhausted) throw new GeminiQuotaError('Gemini API quota is exhausted.');
      throw lastServiceError;
    }

    if (!response.text) throw new InvalidModelOutputError('Gemini returned no analysis.');

    let analysis: ScreenshotAnalysis;
    try {
      analysis = parseAnalysisText(response.text);
    } catch {
      throw new InvalidModelOutputError('Gemini returned an invalid analysis.');
    }

    analysis = alignAnalysisToImages(analysis, images.length);

    if (!hasUsefulInformation(analysis)) {
      throw new NoActionableContentError('No actionable information was found.');
    }

    return analysis;
  } catch (error) {
    if (
      error instanceof InvalidModelOutputError ||
      error instanceof NoActionableContentError ||
      error instanceof MissingApiKeyError ||
      error instanceof GeminiAuthenticationError ||
      error instanceof GeminiQuotaError
    ) {
      throw error;
    }
    throw new GeminiServiceError('Gemini could not analyze the screenshot.');
  }
}

export function analyzeScreenshot(data: string, mimeType: string) {
  return analyzeScreenshots([{ data, mimeType }]);
}
