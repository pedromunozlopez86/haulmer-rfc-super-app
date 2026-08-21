type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Campos que nunca deben aparecer en telemetría ni informes de errores */
const REDACTED_FIELDS = new Set([
  'amount',
  'accountNumber',
  'rut',
  'name',
  'authProof',
  'token',
  'password',
  'pin',
]);

function redact(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, REDACTED_FIELDS.has(k) ? '[REDACTED]' : v]),
  );
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const safeContext = context ? redact(context) : undefined;
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(safeContext && { context: safeContext }),
  };

  // En producción, enviar al sistema de informes de errores (Sentry, Datadog, etc.).
  // La anonimización de PII se aplica antes de cualquier transmisión externa.
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](JSON.stringify(entry));
  }
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => log('debug', msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => log('info', msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log('warn', msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log('error', msg, ctx),
  /** Expone redact para otros módulos que necesiten sanitizar antes de registrar */
  redact,
};

declare const __DEV__: boolean;
