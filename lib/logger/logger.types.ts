export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export type LogCategory = 'PEDIDO' | 'COBRO' | 'ANALITICAS' | 'CLIENTES' | 'COBROS' | 'GENERAL';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  userId?: string;
  pageUrl?: string;
  endpoint?: string;
  payload?: unknown;
  responseBody?: unknown;
  errorCode?: number | string;
  message: string;
  stackTrace?: string;
  documentId?: string;
  isEditing?: boolean;
}

export interface LoggerOptions {
  userId?: string;
  printToConsole?: boolean;
}
