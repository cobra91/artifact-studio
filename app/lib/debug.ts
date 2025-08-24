// Debug configuration
const DEBUG_MODE =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEBUG === "true";

// Debug logger
export const debug = {
  log: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.log("[DEBUG]", ...args);
    }
  },

  error: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.error("[DEBUG ERROR]", ...args);
    }
  },

  warn: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.warn("[DEBUG WARN]", ...args);
    }
  },

  info: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.info("[DEBUG INFO]", ...args);
    }
  },

  group: (label: string) => {
    if (DEBUG_MODE) {
      console.group(`[DEBUG] ${label}`);
    }
  },

  groupEnd: () => {
    if (DEBUG_MODE) {
      console.groupEnd();
    }
  },

  time: (label: string) => {
    if (DEBUG_MODE) {
      console.time(`[DEBUG] ${label}`);
    }
  },

  timeEnd: (label: string) => {
    if (DEBUG_MODE) {
      console.timeEnd(`[DEBUG] ${label}`);
    }
  },
};

// Production logger (toujours actif pour les erreurs importantes)
export const logger = {
  log: (...args: any[]) => {
    console.log(...args);
  },

  error: (...args: any[]) => {
    console.error("[ERROR]", ...args);
  },

  warn: (...args: any[]) => {
    console.warn("[WARN]", ...args);
  },

  info: (...args: any[]) => {
    console.info("[INFO]", ...args);
  },
};

// Helper pour vérifier si le debug est activé
export const isDebugMode = () => DEBUG_MODE;
