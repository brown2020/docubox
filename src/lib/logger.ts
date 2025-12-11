/**
 * Centralized logging utility.
 * Conditionally logs based on environment to keep production clean.
 */

const isDev = process.env.NODE_ENV === "development";

type LogData = Record<string, unknown> | unknown;

/**
 * Logger utility with environment-aware logging.
 * Debug and info logs are suppressed in production.
 */
export const logger = {
  /**
   * Debug logging - only in development.
   */
  debug: (tag: string, data?: LogData) => {
    if (isDev) {
      console.log(`[${tag}]`, data ?? "");
    }
  },

  /**
   * Info logging - only in development.
   */
  info: (tag: string, message: string, data?: LogData) => {
    if (isDev) {
      console.log(`[${tag}] ${message}`, data ?? "");
    }
  },

  /**
   * Warning logging - only in development.
   */
  warn: (tag: string, message: string, data?: LogData) => {
    if (isDev) {
      console.warn(`[${tag}] ${message}`, data ?? "");
    }
  },

  /**
   * Error logging - always logged (important for debugging).
   */
  error: (tag: string, message: string, error?: unknown) => {
    console.error(`[${tag}] ${message}`, error ?? "");
  },
};
