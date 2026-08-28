import { describe, expect, it } from 'vitest';
import { exampleFixtures } from './fixtures';
import { formatTask, mapsUrl, safeExternalUrl, slugifyFileName } from './utils';

describe('action utilities', () => {
  it('allows only safe HTTP links', () => {
    expect(safeExternalUrl('example.com/pay')).toBe('https://example.com/pay');
    expect(safeExternalUrl('https://example.com/pay')).toBe('https://example.com/pay');
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull();
  });

  it('formats a useful task for the clipboard', () => {
    expect(formatTask(exampleFixtures.bill.analysis)).toBe(
      'Pay electric bill ($82.17)\nDue: September 4, 2026\nNotes: Amount due: $82.17. Account ending in 2841.',
    );
  });

  it('generates safe map and file URLs', () => {
    expect(mapsUrl('Fuse at Mason Square, Arlington, VA')).toContain('query=Fuse%20at%20Mason%20Square');
    expect(slugifyFileName('DevFest DC, 2026!')).toBe('devfest-dc-2026');
  });
});
