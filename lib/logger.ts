type LogLevel = "info" | "warn" | "error" | "debug";

interface LogOptions {
  context?: string;
  details?: Record<string, any>;
  error?: Error;
}

function log(level: LogLevel, message: string, options?: LogOptions) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    context: options?.context || "application",
    ...options?.details,
    ...(options?.error && { error: { message: options.error.message, stack: options.error.stack } }),
  };

  switch (level) {
    case "info":
      console.info(JSON.stringify(logEntry));
      break;
    case "warn":
      console.warn(JSON.stringify(logEntry));
      break;
    case "error":
      console.error(JSON.stringify(logEntry));
      break;
    case "debug":
      console.debug(JSON.stringify(logEntry));
      break;
    default:
      console.log(JSON.stringify(logEntry));
  }
}

export const logger = {
  info: (message: string, options?: LogOptions) => log("info", message, options),
  warn: (message: string, options?: LogOptions) => log("warn", message, options),
  error: (message: string, options?: LogOptions) => log("error", message, options),
  debug: (message: string, options?: LogOptions) => log("debug", message, options),
};
