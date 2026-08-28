# SnapTask

> “A screenshot is now a task.”

Repository: [github.com/akashsv01/SnapTask](https://github.com/akashsv01/SnapTask)

SnapTask turns forgotten screenshots into an actionable layer for your life. It understands what screenshots mean, connects related images, identifies what matters, prioritizes what needs attention, and converts passive information into concrete actions.

## The problem

People screenshot things they plan to handle later, but screenshots are passive and easy to forget. Dates, deadlines, confirmation numbers, addresses, and requests disappear into the camera roll.

## The solution

SnapTask uses multimodal AI to understand screenshots, surface what matters, and turn information into an actionable next step—in a few seconds and without requiring an account.

## Features

- Screenshot upload with drag and drop
- **Screenshot Threads** — analyze up to five related screenshots as one situation, with combined context and a timeline
- Clipboard screenshot paste
- PNG, JPG, JPEG, and WEBP support with client-side compression for large images
- Gemini multimodal visual understanding
- Strict, server-validated structured output
- Prominent one-sentence “What matters” result
- **Why Did I Save This?** — a clearly labeled, confidence-gated inference about the user’s original intent
- **Action Plans** — concise checklists that distinguish explicit requirements from useful suggestions
- **Urgency Radar** — now, soon, later, and reference priorities checked against parsed dates on the server
- **Visual Action Overlay** — optional clickable highlights for dates, locations, amounts, links, and other actions
- Dynamic key details and entity extraction
- Standards-compliant `.ics` calendar event generation
- Clipboard-ready task generation
- Map, link, location, email, and phone actions
- Offline example mode for an event, bill, message, and three-screenshot trip
- Responsive, accessible interface
- No account and no persistent screenshot storage

## Tech stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- [Google Gen AI SDK for JavaScript](https://googleapis.github.io/js-genai/) (`@google/genai`)
- Gemini `gemini-3.6-flash` with inline multimodal input, structured JSON output, and stable-model fallback
- Zod 4 for server and client validation
- Lucide React icons
- Vitest
- Vercel-ready deployment

## Local setup

Requirements: Node.js 20.9 or newer and a [Gemini API key](https://aistudio.google.com/app/apikey).

```bash
npm install
```

Create `.env.local` in the project root:

```bash
GEMINI_API_KEY=your_api_key_here
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Only `GEMINI_API_KEY` is required. The key is read exclusively inside the server route and is never shipped to the browser. You may optionally set `GEMINI_MODEL`; live analysis defaults to `gemini-3.6-flash` and automatically tries a stable fallback when the preferred model is unavailable or temporarily overloaded.

## Available scripts

```bash
npm run dev        # Start local development
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript without emitting files
npm test           # Run focused unit and route tests
npm run build      # Create the production build
npm start          # Serve the production build
```

## Demo mode

The homepage includes four clearly labeled example buttons: “Try an event,” “Try a bill,” “Try a message,” and “Try a trip.” They load local fixtures and are explicitly marked as example results. The trip fixture contains a flight, hotel, and conference thread with a combined summary, inferred save intent, urgency, timeline, plan, and visual actions. This path does not call Gemini and remains available if Wi-Fi or the API is unavailable.

The regular upload path always calls the real `/api/analyze` route and requires `GEMINI_API_KEY`.

## Architecture

The browser owns temporary preview, gallery, checklist, and action state. Up to five uploaded images are compressed when useful, sent as multipart form data to a single Next.js route, validated by count, MIME type, per-file size, and combined size, converted to inline base64 in memory, and submitted to Gemini in one multimodal request. SnapTask does not write uploads to disk, a database, or object storage.

Gemini is instructed to return structured JSON for core analysis plus optional agentic intelligence. The server safely extracts the JSON, validates it with Zod, drops malformed optional plans or bounding boxes without losing a valid core result, normalizes duplicate entities, and deterministically reconciles urgency against reliable parsed dates. Invalid core output and API failures become human-readable error responses.

Calendar files are generated entirely in the browser. No OAuth or external calendar access is used.

Key files:

- `app/page.tsx` — application entry point
- `app/api/analyze/route.ts` — secure upload validation and analysis endpoint
- `components/snap-task-app.tsx` — end-to-end client flow
- `components/analysis-result.tsx` — action-oriented result interface
- `components/action-buttons.tsx` — calendar, task, map, link, and copy actions
- `components/action-plan.tsx` — expandable local checklist with explicit/suggested task treatment
- `components/visual-overlay.tsx` — responsive normalized bounding-box actions
- `components/timeline.tsx` — connected screenshot context and chronological thread display
- `lib/gemini.ts` — Gemini model call and instruction prompt
- `lib/schema.ts` — JSON Schema, Zod validation, parsing, and normalization
- `lib/urgency.ts` — deterministic deadline and event urgency reconciliation
- `lib/ics.ts` — RFC-compatible ICS generation
- `lib/fixtures.ts` — clearly labeled offline examples

## Privacy and security

- Gemini API credentials remain server-side.
- Upload MIME type and size are checked on both client and server.
- Screenshot bytes are held only in memory for the current request.
- Raw images and raw Gemini responses are not logged.
- Model output is parsed and validated before reaching the UI.
- Only HTTP(S) links are allowed for external URL actions.
- External links open with `noopener noreferrer`.
- `.env` files are ignored; `.env.example` contains no secret.

## Deploy to Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the repository in Vercel.
3. Keep the detected Next.js framework settings and default build command (`npm run build`).
4. Add `GEMINI_API_KEY` under Project Settings → Environment Variables.
5. Deploy.

Vercel automatically provides the production host value used for absolute social metadata. No additional application environment variable is required.

## Scope decisions

We intentionally kept SnapTask stateless and account-free for the hackathon. Instead of building a screenshot storage platform, we focused on proving that multimodal AI can convert passive screenshots into structured, prioritized action.

We deliberately avoided authentication, persistent history, heavyweight integrations, browser extensions, and direct calendar OAuth. Checklist completion lives only in local React state, and screenshots disappear when the page is refreshed or reset.

## Future improvements

- Camera roll integration
- Automatic screenshot inbox
- Native mobile share sheet
- Direct todo and calendar integrations
- Screenshot history
- Personal context and preferences

## Known limitations

- AI extraction quality depends on screenshot clarity and the information actually shown.
- Semantic relationships and visual bounding boxes are model estimates. Optional overlays are omitted when coordinates fail validation.
- SnapTask intentionally hides the calendar action when a complete date cannot be determined confidently.
- Generated tasks and calendar files should be checked before relying on high-stakes dates or amounts.
- There is no history: refreshing or analyzing another screenshot clears the current result.

See [DEMO.md](./DEMO.md) for the complete 90-second demo flow and presenter script.
