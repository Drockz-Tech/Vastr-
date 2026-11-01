import { describe, expect, it } from 'vitest';

import { summarizeWearHistory } from './analytics';
import { Log } from '../types/database';

const log = (id: string, outfitId: string, wornDate: string): Log => ({
  id,
  user_id: 'user-1',
  outfit_id: outfitId,
  event_tag: null,
  worn_date: wornDate,
  created_at: `${wornDate}T10:00:00.000Z`,
});

describe('summarizeWearHistory', () => {
  it('calculates totals, unique looks, and recent wears', () => {
    const result = summarizeWearHistory([
      log('1', 'outfit-1', '2026-11-01'),
      log('2', 'outfit-1', '2026-10-25'),
      log('3', 'outfit-2', '2026-09-01'),
    ], new Date('2026-11-01T12:00:00.000Z'));

    expect(result.totalWears).toBe(3);
    expect(result.uniqueLooks).toBe(2);
    expect(result.recentWears).toBe(2);
    expect(result.history).toHaveLength(3);
  });

  it('limits displayed history without changing totals', () => {
    const logs = Array.from({ length: 12 }, (_, index) =>
      log(String(index), `outfit-${index}`, '2026-11-01'),
    );
    const result = summarizeWearHistory(logs, new Date('2026-11-01T12:00:00.000Z'));

    expect(result.totalWears).toBe(12);
    expect(result.history).toHaveLength(10);
  });
});
