import { Log } from '../types/database';

export function summarizeWearHistory(logs: Log[], now: Date = new Date()) {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 30);

  return {
    history: logs.slice(0, 10),
    totalWears: logs.length,
    uniqueLooks: new Set(logs.map((log) => log.outfit_id)).size,
    recentWears: logs.filter((log) => new Date(`${log.worn_date}T00:00:00Z`) >= cutoff).length,
  };
}
