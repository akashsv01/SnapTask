import { describe, expect, it } from 'vitest';
import { exampleFixtures } from './fixtures';
import { analysisSchema, parseAnalysisText } from './schema';

describe('analysis schema', () => {
  it('accepts every bundled example fixture', () => {
    for (const fixture of Object.values(exampleFixtures)) {
      expect(analysisSchema.safeParse(fixture.analysis).success).toBe(true);
    }
  });

  it('extracts JSON from a fenced model response', () => {
    const response = `\`\`\`json\n${JSON.stringify(exampleFixtures.event.analysis)}\n\`\`\``;
    expect(parseAnalysisText(response).title).toBe('DevFest DC 2026');
  });

  it('deduplicates repeated entities', () => {
    const fixture = structuredClone(exampleFixtures.bill.analysis);
    fixture.entities.amounts = ['$82.17', '$82.17'];
    expect(parseAnalysisText(JSON.stringify(fixture)).entities.amounts).toEqual(['$82.17']);
  });

  it('rejects incomplete or out-of-range model output', () => {
    expect(analysisSchema.safeParse({ title: 'Missing everything else' }).success).toBe(false);
    expect(
      analysisSchema.safeParse({ ...exampleFixtures.message.analysis, confidence: 1.2 }).success,
    ).toBe(false);
  });

  it('keeps legacy core analysis compatible when optional intelligence is absent', () => {
    const legacy = structuredClone(exampleFixtures.bill.analysis) as Record<string, unknown>;
    delete legacy.whySaved;
    delete legacy.urgency;
    delete legacy.plan;
    delete legacy.thread;
    delete legacy.visualEntities;

    const parsed = analysisSchema.parse(legacy);
    expect(parsed.whySaved).toBeNull();
    expect(parsed.plan).toEqual([]);
    expect(parsed.visualEntities).toEqual([]);
  });

  it('parses at most five valid plan tasks and preserves explicit versus suggested sources', () => {
    const value = structuredClone(exampleFixtures.trip.analysis) as Record<string, unknown>;
    value.plan = [
      ...exampleFixtures.trip.analysis.plan,
      { task: 'Pack a charger', dueDate: null, priority: 'low', source: 'suggested' },
      { task: '', dueDate: null, priority: 'urgent', source: 'invented' },
    ];

    const parsed = analysisSchema.parse(value);
    expect(parsed.plan).toHaveLength(5);
    expect(parsed.plan.some((item) => item.source === 'explicit' || item.source === 'suggested')).toBe(true);
  });

  it('drops invalid visual bounding boxes without breaking core analysis', () => {
    const value = structuredClone(exampleFixtures.bill.analysis) as Record<string, unknown>;
    value.visualEntities = [
      ...exampleFixtures.bill.analysis.visualEntities,
      {
        type: 'amount',
        label: 'Outside image',
        sourceImageIndex: 0,
        box: { x: 0.9, y: 0.2, width: 0.4, height: 0.1 },
        action: 'copy',
      },
    ];

    const parsed = analysisSchema.parse(value);
    expect(parsed.visualEntities).toHaveLength(exampleFixtures.bill.analysis.visualEntities.length);
    expect(parsed.title).toBe('Electric bill');
  });
});
