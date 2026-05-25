// Stub para Jest: el bootstrap del shell usa msw/browser sólo en runtime.
module.exports = {
  setupWorker: () => ({
    start: () => Promise.resolve(),
    stop: () => undefined,
    resetHandlers: () => undefined,
  }),
};
