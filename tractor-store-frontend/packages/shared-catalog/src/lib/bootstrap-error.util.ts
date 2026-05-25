/** Normaliza el motivo de fallo del bootstrap (entry shell y MFEs). */
export function normalizeBootstrapFailure(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error(String(reason));
}

/** Evita console.error en bootstrap (regla Sonar) propagando el fallo. */
export function rethrowBootstrapFailure(reason: unknown): never {
  throw normalizeBootstrapFailure(reason);
}
