/**
 * Logger condicional para desarrollo
 * Solo muestra logs en modo desarrollo (import.meta.env.DEV)
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Log de información (solo en desarrollo)
 */
export const logInfo = (message: string, ...args: any[]): void => {
  if (isDevelopment) {
    console.log(`[INFO] ${message}`, ...args);
  }
};

/**
 * Log de error (siempre se muestra)
 */
export const logError = (message: string, error?: any): void => {
  console.error(`[ERROR] ${message}`, error || '');
};

/**
 * Log de advertencia (solo en desarrollo)
 */
export const logWarn = (message: string, ...args: any[]): void => {
  if (isDevelopment) {
    console.warn(`[WARN] ${message}`, ...args);
  }
};

/**
 * Log de debug (solo en desarrollo)
 */
export const logDebug = (message: string, ...args: any[]): void => {
  if (isDevelopment) {
    console.debug(`[DEBUG] ${message}`, ...args);
  }
};

/**
 * Objeto logger exportado por defecto
 */
const logger = {
  info: logInfo,
  error: logError,
  warn: logWarn,
  debug: logDebug,
};

export default logger;
