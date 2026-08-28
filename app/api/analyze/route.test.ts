import { afterEach, describe, expect, it } from 'vitest';
import { POST } from './route';

const originalKey = process.env.GEMINI_API_KEY;

afterEach(() => {
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
});

describe('POST /api/analyze', () => {
  it('rejects unsupported files before calling Gemini', async () => {
    const form = new FormData();
    form.append('image', new File(['hello'], 'notes.txt', { type: 'text/plain' }));
    const response = await POST(new Request('http://localhost/api/analyze', { method: 'POST', body: form }));
    expect(response.status).toBe(415);
    await expect(response.json()).resolves.toMatchObject({ code: 'UNSUPPORTED_TYPE' });
  });

  it('reports a missing server-side API key without exposing internals', async () => {
    delete process.env.GEMINI_API_KEY;
    const form = new FormData();
    form.append('image', new File(['fake-image'], 'shot.png', { type: 'image/png' }));
    const response = await POST(new Request('http://localhost/api/analyze', { method: 'POST', body: form }));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ code: 'MISSING_API_KEY' });
  });

  it('accepts multiple image fields before handing the thread to Gemini', async () => {
    delete process.env.GEMINI_API_KEY;
    const form = new FormData();
    form.append('images', new File(['first'], 'flight.png', { type: 'image/png' }));
    form.append('images', new File(['second'], 'hotel.jpg', { type: 'image/jpeg' }));
    const response = await POST(new Request('http://localhost/api/analyze', { method: 'POST', body: form }));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ code: 'MISSING_API_KEY' });
  });

  it('rejects screenshot threads larger than five images', async () => {
    const form = new FormData();
    for (let index = 0; index < 6; index += 1) {
      form.append('images', new File([`image-${index}`], `${index}.png`, { type: 'image/png' }));
    }
    const response = await POST(new Request('http://localhost/api/analyze', { method: 'POST', body: form }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: 'TOO_MANY_FILES' });
  });
});
