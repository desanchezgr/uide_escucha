export function logError(context: string, error: unknown) {
  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error && error.stack ? `\n${error.stack}` : '';
  process.stderr.write(`[${timestamp}] ERROR [${context}]: ${message}${stack}\n`);
}

export function logWarn(context: string, message: string) {
  const timestamp = new Date().toISOString();
  process.stderr.write(`[${timestamp}] WARN [${context}]: ${message}\n`);
}

export function logInfo(context: string, message: string) {
  const timestamp = new Date().toISOString();
  process.stdout.write(`[${timestamp}] INFO [${context}]: ${message}\n`);
}
