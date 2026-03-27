import fs from 'fs';
import path from 'path';
import type { LogEntry, LogCategory, LoggerOptions } from './logger.types';

const SEPARATOR = '═'.repeat(60);

export function formatEntry(entry: LogEntry): string {
  const lines: string[] = [SEPARATOR];

  lines.push(`📅 Timestamp : ${entry.timestamp}`);
  lines.push(`🔖 Level     : ${entry.level}`);
  lines.push(`📂 Category  : ${entry.category}`);

  if (entry.userId)   lines.push(`👤 User      : ${entry.userId}`);
  if (entry.pageUrl)  lines.push(`🌐 Page URL  : ${entry.pageUrl}`);
  if (entry.endpoint) lines.push(`🔗 Endpoint  : ${entry.endpoint}`);

  if (entry.payload !== undefined) {
    lines.push(`📦 Payload   :\n${JSON.stringify(entry.payload, null, 2)}`);
  }

  if (entry.responseBody !== undefined) {
    lines.push(`📨 Response  :\n${JSON.stringify(entry.responseBody, null, 2)}`);
  }

  if (entry.errorCode !== undefined) lines.push(`🚨 ErrorCode : ${entry.errorCode}`);

  lines.push(`💬 Message   : ${entry.message}`);

  if (entry.stackTrace) lines.push(`🔍 StackTrace:\n${entry.stackTrace}`);

  lines.push(SEPARATOR);

  return lines.join('\n') + '\n';
}

export function ensureDirectory(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function getLogFilePath(category: LogCategory, timestamp: string): string {
  const date = timestamp.slice(0, 10); // YYYY-MM-DD
  const dir = path.join(process.cwd(), 'logs', category.toLowerCase());
  ensureDirectory(dir);
  return path.join(dir, `${date}.txt`);
}

export function writeLog(entry: LogEntry, options?: LoggerOptions): void {
  const filePath = getLogFilePath(entry.category, entry.timestamp);
  const text = formatEntry(entry);
  fs.appendFileSync(filePath, text, 'utf8');

  if (options?.printToConsole) {
    console.log(text);
  }
}

export class ISyncWebLogger {
  private options: LoggerOptions;

  constructor(options: LoggerOptions = {}) {
    this.options = options;
  }

  setUser(userId: string): void {
    this.options.userId = userId;
  }

  private buildEntry(partial: Omit<LogEntry, 'timestamp'>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      userId: this.options.userId,
      ...partial,
    };
  }

  logQuotation({ endpoint, payload, message = 'Cotización procesada' }: {
    endpoint: string;
    payload?: unknown;
    message?: string;
  }): void {
    const entry = this.buildEntry({ level: 'INFO', category: 'PEDIDO', endpoint, payload, message });
    writeLog(entry, this.options);
  }

  logQuotationError({ endpoint, payload, errorCode, message, responseBody, stackTrace }: {
    endpoint: string;
    payload?: unknown;
    errorCode: number | string;
    message: string;
    responseBody?: unknown;
    stackTrace?: string;
  }): void {
    const entry = this.buildEntry({
      level: 'ERROR', category: 'PEDIDO',
      endpoint, payload, errorCode, message, responseBody, stackTrace,
    });
    writeLog(entry, this.options);
  }

  logGetError({ endpoint, category = 'GENERAL', errorCode, message, responseBody, stackTrace }: {
    endpoint: string;
    category?: import('./logger.types').LogCategory;
    errorCode: number | string;
    message: string;
    responseBody?: unknown;
    stackTrace?: string;
  }): void {
    const entry = this.buildEntry({
      level: 'ERROR', category,
      endpoint, errorCode, message, responseBody, stackTrace,
    });
    writeLog(entry, this.options);
  }

  logPostError({ endpoint, category = 'PEDIDO', payload, errorCode, message, responseBody, stackTrace }: {
    endpoint: string;
    category?: import('./logger.types').LogCategory;
    payload?: unknown;
    errorCode: number | string;
    message: string;
    responseBody?: unknown;
    stackTrace?: string;
  }): void {
    const entry = this.buildEntry({
      level: 'ERROR', category,
      endpoint, payload, errorCode, message, responseBody, stackTrace,
    });
    writeLog(entry, this.options);
  }

  log(partial: Omit<LogEntry, 'timestamp'>): void {
    const entry = this.buildEntry(partial);
    writeLog(entry, this.options);
  }

  listLogs(category?: LogCategory): string[] {
    const baseDir = path.join(process.cwd(), 'logs');
    if (category) {
      const dir = path.join(baseDir, category.toLowerCase());
      if (!fs.existsSync(dir)) return [];
      return fs.readdirSync(dir).map((f) => path.join(dir, f));
    }

    if (!fs.existsSync(baseDir)) return [];
    const categories = fs.readdirSync(baseDir);
    return categories.flatMap((cat) => {
      const dir = path.join(baseDir, cat);
      return fs.readdirSync(dir).map((f) => path.join(dir, f));
    });
  }

  readLog(filePath: string): string {
    return fs.readFileSync(filePath, 'utf8');
  }

  cleanOldLogs(olderThanDays = 30): void {
    const files = this.listLogs();
    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

    for (const filePath of files) {
      const name = path.basename(filePath, '.txt'); // YYYY-MM-DD
      const fileDate = new Date(name).getTime();
      if (!isNaN(fileDate) && fileDate < cutoff) {
        fs.unlinkSync(filePath);
      }
    }
  }
}

export const webLogger = new ISyncWebLogger({
  printToConsole: process.env.NODE_ENV === 'development',
});
