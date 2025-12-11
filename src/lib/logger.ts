/**
 * Debug-conditional logging utility.
 * Only logs in development mode to avoid console noise in production.
 */

const isDev = process.env.NODE_ENV === "development";

type LogLevel = "log" | "warn" | "error" | "info";

interface LogOptions {
  /** Force log even in production (use sparingly) */
  force?: boolean;
}

/**
 * Creates a prefixed logger for a specific module/action.
 */
export function createLogger(prefix: string) {
  const formatMessage = (message: string) => `[${prefix}] ${message}`;

  return {
    log: (message: string, data?: unknown, options?: LogOptions) => {
      if (isDev || options?.force) {
        if (data !== undefined) {
          console.log(formatMessage(message), data);
        } else {
          console.log(formatMessage(message));
        }
      }
    },

    warn: (message: string, data?: unknown, options?: LogOptions) => {
      if (isDev || options?.force) {
        if (data !== undefined) {
          console.warn(formatMessage(message), data);
        } else {
          console.warn(formatMessage(message));
        }
      }
    },

    error: (message: string, data?: unknown) => {
      // Always log errors
      if (data !== undefined) {
        console.error(formatMessage(message), data);
      } else {
        console.error(formatMessage(message));
      }
    },

    info: (message: string, data?: unknown, options?: LogOptions) => {
      if (isDev || options?.force) {
        if (data !== undefined) {
          console.info(formatMessage(message), data);
        } else {
          console.info(formatMessage(message));
        }
      }
    },
  };
}

/**
 * Simple debug log that only runs in development.
 */
export function debugLog(
  message: string,
  data?: unknown,
  level: LogLevel = "log"
) {
  if (!isDev) return;

  if (data !== undefined) {
    console[level](message, data);
  } else {
    console[level](message);
  }
}

