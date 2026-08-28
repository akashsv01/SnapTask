import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { exampleFixtures } from './fixtures';

const genAiMock = vi.hoisted(() => ({
  generateContent: vi.fn(),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent: genAiMock.generateContent };
  },
}));

import {
  analyzeScreenshot,
  analyzeScreenshots,
  GeminiAuthenticationError,
  GeminiQuotaError,
} from './gemini';

const originalApiKey = process.env.GEMINI_API_KEY;
const originalModel = process.env.GEMINI_MODEL;

function apiError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

beforeEach(() => {
  process.env.GEMINI_API_KEY = 'test-key';
  delete process.env.GEMINI_MODEL;
  genAiMock.generateContent.mockReset();
});

afterAll(() => {
  if (originalApiKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalApiKey;

  if (originalModel === undefined) delete process.env.GEMINI_MODEL;
  else process.env.GEMINI_MODEL = originalModel;
});

describe('analyzeScreenshot', () => {
  it('falls back to a stable model when the preferred model is overloaded', async () => {
    genAiMock.generateContent
      .mockRejectedValueOnce(apiError(503, 'Model is experiencing high demand.'))
      .mockResolvedValueOnce({ text: JSON.stringify(exampleFixtures.bill.analysis) });

    const result = await analyzeScreenshot('base64-image', 'image/png');

    expect(result.title).toBe(exampleFixtures.bill.analysis.title);
    expect(genAiMock.generateContent).toHaveBeenCalledTimes(2);
    expect(genAiMock.generateContent.mock.calls.map(([request]) => request.model)).toEqual([
      'gemini-3.6-flash',
      'gemini-3.5-flash',
    ]);
  });

  it('does not hide an invalid or unauthorized API key behind fallbacks', async () => {
    genAiMock.generateContent.mockRejectedValueOnce(apiError(403, 'API key not valid.'));

    await expect(analyzeScreenshot('base64-image', 'image/png')).rejects.toBeInstanceOf(
      GeminiAuthenticationError,
    );
    expect(genAiMock.generateContent).toHaveBeenCalledTimes(1);
  });

  it('reports exhausted quota after all available models have been tried', async () => {
    genAiMock.generateContent.mockRejectedValue(apiError(429, 'Quota exceeded.'));

    await expect(analyzeScreenshot('base64-image', 'image/png')).rejects.toBeInstanceOf(
      GeminiQuotaError,
    );
    expect(genAiMock.generateContent).toHaveBeenCalledTimes(2);
  });

  it('sends every screenshot in a thread to the multimodal request', async () => {
    genAiMock.generateContent.mockResolvedValueOnce({ text: JSON.stringify(exampleFixtures.trip.analysis) });

    const result = await analyzeScreenshots([
      { data: 'flight-image', mimeType: 'image/png' },
      { data: 'hotel-image', mimeType: 'image/jpeg' },
      { data: 'conference-image', mimeType: 'image/webp' },
    ]);

    expect(result.thread?.isRelated).toBe(true);
    const request = genAiMock.generateContent.mock.calls[0][0];
    expect(request.contents.filter((part: { inlineData?: unknown }) => part.inlineData)).toHaveLength(3);
  });
});
