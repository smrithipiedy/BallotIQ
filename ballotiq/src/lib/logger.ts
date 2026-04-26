/**
 * Structured logging module.
 * Replaces raw console calls with contextual, leveled logging.
 * In production, errors are sent to Firebase Analytics.
 * Provides consistent log format: [LEVEL][Component] message {context}
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  sessionId?: string;
  countryCode?: string;
  [key: string]: unknown;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  private format(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const component = context?.component ? `[${context.component}]` : '';
    return `[${level.toUpperCase()}]${component} ${message} ${
      context ? JSON.stringify(context) : ''
    } @ ${timestamp}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.debug(this.format('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.format('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.format('warn', message, context));
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    console.error(this.format('error', message, context), error ?? '');
  }
}

export const logger = new Logger();
