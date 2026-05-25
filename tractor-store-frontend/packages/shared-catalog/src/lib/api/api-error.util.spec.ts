import { messageFromHttpError } from './api-error.util';

describe('messageFromHttpError', () => {
  it('maps OUT_OF_STOCK code', () => {
    expect(
      messageFromHttpError({ error: { code: 'OUT_OF_STOCK', message: 'x' } })
    ).toBe('Este producto no tiene stock disponible.');
  });

  it('maps INSUFFICIENT_STOCK code', () => {
    expect(
      messageFromHttpError({ error: { code: 'INSUFFICIENT_STOCK' } })
    ).toBe('Ya tienes el máximo disponible de este producto en el carrito.');
  });

  it('uses body message when code unknown', () => {
    expect(messageFromHttpError({ error: { message: 'Custom' } })).toBe('Custom');
  });

  it('returns fallback for unknown error', () => {
    expect(messageFromHttpError(null, 'Fallback')).toBe('Fallback');
  });
});
