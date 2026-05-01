/**
 * Conditional logger — only outputs in development mode.
 * Replace all console.log / console.error with these to prevent
 * leaking internal details in production bundles.
 */
const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log("[GridXD]", ...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info("[GridXD]", ...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn("[GridXD WARN]", ...args);
  },
  error: (...args: unknown[]) => {
    if (isDev) console.error("[GridXD ERROR]", ...args);
  },
  group: (label: string, fn: () => void) => {
    if (isDev) {
      console.group(`[GridXD] ${label}`);
      fn();
      console.groupEnd();
    }
  },
};
