export interface ApiErrorBody {
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
}

const CART_ERROR_MESSAGES: Record<string, string> = {
  OUT_OF_STOCK: 'Este producto no tiene stock disponible.',
  INSUFFICIENT_STOCK: 'Ya tienes el máximo disponible de este producto en el carrito.',
};

export function messageFromHttpError(error: unknown, fallback = 'No se pudo completar la operación.'): string {
  const body = (error as { error?: ApiErrorBody })?.error;
  if (body?.code && CART_ERROR_MESSAGES[body.code]) {
    return CART_ERROR_MESSAGES[body.code];
  }
  if (body?.message) {
    return body.message;
  }
  return fallback;
}
