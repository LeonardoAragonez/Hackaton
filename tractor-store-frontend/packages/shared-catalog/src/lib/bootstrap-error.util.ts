/** Evita console.error en bootstrap (regla Sonar) propagando el fallo. */
export function rethrowBootstrapFailure(reason: unknown): never {
  throw reason instanceof Error ? reason : new Error(String(reason));
}
