import { z } from 'zod';
import { resolveUrgency } from '@/lib/urgency';

export const contentTypes = [
  'event', 'bill', 'appointment', 'travel', 'email', 'message', 'product',
  'recipe', 'class', 'ticket', 'reservation', 'document', 'other',
] as const;

export const urgencyLevels = ['now', 'soon', 'later', 'reference'] as const;
export const planPriorities = ['high', 'medium', 'low'] as const;
export const planSources = ['explicit', 'suggested'] as const;
export const visualEntityTypes = [
  'date', 'time', 'location', 'amount', 'url', 'phone', 'deadline', 'other',
] as const;
export const visualActions = ['calendar', 'maps', 'task', 'open_link', 'copy'] as const;

const conciseText = z.string().trim().min(1).max(500);
const nullableText = z.string().trim().min(1).max(1_000).nullable();
const entityList = z.array(z.string().trim().min(1).max(500)).max(20);

const whySavedValueSchema = z.object({
  reason: z.string().trim().min(1).max(300),
  confidence: z.number().min(0).max(1),
}).strict();

const planItemValueSchema = z.object({
  task: z.string().trim().min(1).max(180),
  dueDate: nullableText,
  priority: z.enum(planPriorities),
  source: z.enum(planSources),
}).strict();

const urgencyValueSchema = z.object({
  level: z.enum(urgencyLevels),
  score: z.number().min(0).max(100),
  reason: z.string().trim().min(1).max(240),
}).strict();

const timelineItemValueSchema = z.object({
  label: z.string().trim().min(1).max(100),
  dateTime: nullableText,
  description: z.string().trim().min(1).max(300),
  sourceImageIndex: z.number().int().min(0).max(4),
}).strict();

const imageSummaryValueSchema = z.object({
  sourceImageIndex: z.number().int().min(0).max(4),
  title: z.string().trim().min(1).max(140),
  summary: conciseText,
  whatMatters: z.string().trim().min(1).max(280),
  urgency: urgencyValueSchema,
}).strict();

const threadValueSchema = z.object({
  isMultiImage: z.boolean(),
  isRelated: z.boolean(),
  relationship: z.string().trim().min(1).max(300),
  combinedSummary: conciseText,
  combinedWhatMatters: z.string().trim().min(1).max(400),
  imageSummaries: z.array(imageSummaryValueSchema).max(5),
  timeline: z.array(timelineItemValueSchema).max(12),
}).strict();

const boxValueSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().positive().max(1),
  height: z.number().positive().max(1),
}).strict().refine((box) => box.x + box.width <= 1.001 && box.y + box.height <= 1.001, {
  message: 'Bounding boxes must remain inside the image.',
});

const visualEntityValueSchema = z.object({
  type: z.enum(visualEntityTypes),
  label: z.string().trim().min(1).max(180),
  sourceImageIndex: z.number().int().min(0).max(4),
  box: boxValueSchema,
  action: z.enum(visualActions).nullable(),
}).strict();

function safeValue<T>(schema: z.ZodType<T>, value: unknown): T | null {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

const whySavedFieldSchema = z.unknown().optional().transform((value) => safeValue(whySavedValueSchema, value));
const urgencyFieldSchema = z.unknown().optional().transform((value) => safeValue(urgencyValueSchema, value));

const planFieldSchema = z.array(z.unknown()).max(12).optional().transform((items) =>
  (items ?? [])
    .map((item) => safeValue(planItemValueSchema, item))
    .filter((item): item is z.infer<typeof planItemValueSchema> => item !== null)
    .slice(0, 5),
);

const threadFieldSchema = z.unknown().optional().transform((value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const timeline = Array.isArray(input.timeline)
    ? input.timeline
        .map((item) => safeValue(timelineItemValueSchema, item))
        .filter((item): item is z.infer<typeof timelineItemValueSchema> => item !== null)
        .slice(0, 12)
    : [];
  const imageSummaries = Array.isArray(input.imageSummaries)
    ? input.imageSummaries
        .map((item) => safeValue(imageSummaryValueSchema, item))
        .filter((item): item is z.infer<typeof imageSummaryValueSchema> => item !== null)
        .slice(0, 5)
    : [];
  return safeValue(threadValueSchema, { ...input, timeline, imageSummaries });
});

const visualEntitiesFieldSchema = z.array(z.unknown()).max(30).optional().transform((items) =>
  (items ?? [])
    .map((item) => safeValue(visualEntityValueSchema, item))
    .filter((item): item is z.infer<typeof visualEntityValueSchema> => item !== null)
    .slice(0, 20),
);

export const analysisSchema = z.object({
  contentType: z.enum(contentTypes),
  title: z.string().trim().min(1).max(140),
  summary: conciseText,
  whatMatters: z.string().trim().min(1).max(280),
  whySaved: whySavedFieldSchema,
  urgency: urgencyFieldSchema,
  plan: planFieldSchema,
  thread: threadFieldSchema,
  visualEntities: visualEntitiesFieldSchema,
  suggestedAction: z.object({
    label: z.string().trim().min(1).max(80),
    reason: z.string().trim().min(1).max(300),
  }).strict().nullable(),
  canCreateCalendarEvent: z.boolean(),
  canCreateTask: z.boolean(),
  event: z.object({
    title: nullableText,
    startDateTime: nullableText,
    endDateTime: nullableText,
    allDay: z.boolean().nullable(),
    location: nullableText,
    description: nullableText,
  }).strict().nullable(),
  task: z.object({
    title: z.string().trim().min(1).max(180),
    dueDate: nullableText,
    notes: nullableText,
  }).strict().nullable(),
  entities: z.object({
    dates: entityList,
    times: entityList,
    locations: entityList,
    urls: entityList,
    emails: entityList,
    phoneNumbers: entityList,
    amounts: entityList,
  }).strict(),
  keyDetails: z.array(z.object({
    label: z.string().trim().min(1).max(60),
    value: z.string().trim().min(1).max(300),
  }).strict()).max(12),
  warnings: z.array(z.string().trim().min(1).max(300)).max(5),
  confidence: z.number().min(0).max(1),
}).strict();

export type ScreenshotAnalysis = z.infer<typeof analysisSchema>;
export type ContentType = (typeof contentTypes)[number];
export type PlanItem = z.infer<typeof planItemValueSchema>;
export type ScreenshotThread = z.infer<typeof threadValueSchema>;
export type VisualEntity = z.infer<typeof visualEntityValueSchema>;

const nullableStringJsonSchema = { anyOf: [{ type: 'string' }, { type: 'null' }] } as const;

const urgencyJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['level', 'score', 'reason'],
  properties: {
    level: { type: 'string', enum: urgencyLevels },
    score: { type: 'number', minimum: 0, maximum: 100 },
    reason: { type: 'string' },
  },
} as const;

export const analysisJsonSchema = {
  type: 'object',
  additionalProperties: true,
  required: [
    'contentType', 'title', 'summary', 'whatMatters', 'whySaved', 'urgency', 'plan',
    'thread', 'suggestedAction', 'canCreateCalendarEvent',
    'canCreateTask', 'event', 'task', 'entities', 'keyDetails', 'warnings', 'confidence',
  ],
  properties: {
    contentType: { type: 'string', enum: contentTypes },
    title: { type: 'string', description: 'Short, human-readable title.' },
    summary: { type: 'string', description: 'One or two plain-English sentences.' },
    whatMatters: { type: 'string', description: 'One concise sentence stating what the user needs to know or do.' },
    whySaved: {
      type: 'object', additionalProperties: false, required: ['reason', 'confidence'],
      properties: {
        reason: { type: 'string', description: 'Uncertain inference phrased with probably, likely, or may.' },
        confidence: { type: 'number', minimum: 0, maximum: 1 },
      },
    },
    urgency: urgencyJsonSchema,
    plan: {
      type: 'array', maxItems: 5,
      items: {
        type: 'object', additionalProperties: false, required: ['task', 'dueDate', 'priority', 'source'],
        properties: {
          task: { type: 'string' },
          dueDate: nullableStringJsonSchema,
          priority: { type: 'string', enum: planPriorities },
          source: { type: 'string', enum: planSources },
        },
      },
    },
    thread: {
      type: 'object', additionalProperties: true,
      required: ['isMultiImage', 'isRelated', 'relationship', 'combinedSummary', 'combinedWhatMatters', 'imageSummaries', 'timeline'],
      properties: {
        isMultiImage: { type: 'boolean' },
        isRelated: { type: 'boolean' },
        relationship: { type: 'string' },
        combinedSummary: { type: 'string' },
        combinedWhatMatters: { type: 'string' },
        imageSummaries: {
          type: 'array', maxItems: 5,
          items: { type: 'object', additionalProperties: true },
        },
        timeline: {
          type: 'array', maxItems: 12,
          items: {
            type: 'object', additionalProperties: false,
            required: ['label', 'dateTime', 'description', 'sourceImageIndex'],
            properties: {
              label: { type: 'string' },
              dateTime: nullableStringJsonSchema,
              description: { type: 'string' },
              sourceImageIndex: { type: 'integer', minimum: 0, maximum: 4 },
            },
          },
        },
      },
    },
    suggestedAction: {
      anyOf: [
        {
          type: 'object', additionalProperties: false, required: ['label', 'reason'],
          properties: { label: { type: 'string' }, reason: { type: 'string' } },
        },
        { type: 'null' },
      ],
    },
    canCreateCalendarEvent: { type: 'boolean', description: 'True only when a full, unambiguous calendar date is available.' },
    canCreateTask: { type: 'boolean' },
    event: {
      anyOf: [
        {
          type: 'object', additionalProperties: false,
          required: ['title', 'startDateTime', 'endDateTime', 'allDay', 'location', 'description'],
          properties: {
            title: nullableStringJsonSchema,
            startDateTime: nullableStringJsonSchema,
            endDateTime: nullableStringJsonSchema,
            allDay: { anyOf: [{ type: 'boolean' }, { type: 'null' }] },
            location: nullableStringJsonSchema,
            description: nullableStringJsonSchema,
          },
        },
        { type: 'null' },
      ],
    },
    task: {
      anyOf: [
        {
          type: 'object', additionalProperties: false, required: ['title', 'dueDate', 'notes'],
          properties: { title: { type: 'string' }, dueDate: nullableStringJsonSchema, notes: nullableStringJsonSchema },
        },
        { type: 'null' },
      ],
    },
    entities: {
      type: 'object', additionalProperties: false,
      required: ['dates', 'times', 'locations', 'urls', 'emails', 'phoneNumbers', 'amounts'],
      properties: Object.fromEntries(
        ['dates', 'times', 'locations', 'urls', 'emails', 'phoneNumbers', 'amounts'].map((key) => [
          key, { type: 'array', items: { type: 'string' } },
        ]),
      ),
    },
    keyDetails: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false, required: ['label', 'value'],
        properties: { label: { type: 'string' }, value: { type: 'string' } },
      },
    },
    warnings: { type: 'array', items: { type: 'string' } },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
  },
} as const;

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function normalizeAnalysis(value: ScreenshotAnalysis, now = new Date()): ScreenshotAnalysis {
  const eventReady = Boolean(value.canCreateCalendarEvent && value.event?.title && value.event.startDateTime);
  const taskReady = Boolean(value.canCreateTask && value.task?.title);
  const normalized = {
    ...value,
    canCreateCalendarEvent: eventReady,
    canCreateTask: taskReady,
    entities: {
      dates: unique(value.entities.dates),
      times: unique(value.entities.times),
      locations: unique(value.entities.locations),
      urls: unique(value.entities.urls),
      emails: unique(value.entities.emails),
      phoneNumbers: unique(value.entities.phoneNumbers),
      amounts: unique(value.entities.amounts),
    },
    keyDetails: value.keyDetails.filter((detail, index, all) =>
      all.findIndex((candidate) => candidate.label === detail.label && candidate.value === detail.value) === index,
    ),
    visualEntities: value.visualEntities.filter((entity, index, all) =>
      all.findIndex((candidate) =>
        candidate.sourceImageIndex === entity.sourceImageIndex &&
        candidate.type === entity.type &&
        candidate.label === entity.label,
      ) === index,
    ),
  };

  return { ...normalized, urgency: resolveUrgency(normalized, now) };
}

export function parseAnalysisText(rawText: string): ScreenshotAnalysis {
  const stripped = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const candidates = [stripped];
  const firstBrace = stripped.indexOf('{');
  const lastBrace = stripped.lastIndexOf('}');

  if (firstBrace >= 0 && lastBrace > firstBrace) candidates.push(stripped.slice(firstBrace, lastBrace + 1));

  for (const candidate of [...new Set(candidates)]) {
    try {
      const parsed = analysisSchema.safeParse(JSON.parse(candidate));
      if (parsed.success) return normalizeAnalysis(parsed.data);
    } catch {
      // Try the next safe candidate.
    }
  }

  throw new Error('Gemini returned an invalid analysis.');
}

export function hasUsefulInformation(analysis: ScreenshotAnalysis) {
  const entityCount = Object.values(analysis.entities).reduce((sum, values) => sum + values.length, 0);
  return !(
    analysis.contentType === 'other' && analysis.confidence < 0.35 &&
    analysis.keyDetails.length === 0 && entityCount === 0 && !analysis.event && !analysis.task
  );
}
