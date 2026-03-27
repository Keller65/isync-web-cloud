import type { LogEntry } from './logger.types';

type ClientLogEntry = Omit<LogEntry, 'timestamp'> & { userId?: string };

export async function logClient(entry: ClientLogEntry): Promise<void> {
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
  } catch {
    // silent fail — el logging nunca debe romper la app
  }
}
