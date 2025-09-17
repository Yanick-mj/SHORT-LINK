export const logger = {
  info: (...args) => {
    if (import.meta.env.DEV) console.info(...args);
  },
  warn: (...args) => {
    if (import.meta.env.DEV) console.warn(...args);
  },
  error: (...args) => {
    if (import.meta.env.DEV) console.error(...args);
  },
};
