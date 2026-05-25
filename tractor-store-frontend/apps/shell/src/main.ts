/** Sin imports de shared-catalog aquí: MF exige consumo perezoso del entry. */
import('./bootstrap').catch((reason: unknown): never => {
  throw reason instanceof Error ? reason : new Error(String(reason));
});
