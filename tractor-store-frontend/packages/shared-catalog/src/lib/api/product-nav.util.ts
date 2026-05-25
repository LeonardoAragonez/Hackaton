/** Parsea URLs del catálogo tipo `/product/CL-01` o `/product/AU-02?sku=AU-02-OG`. */
export function parseProductUrl(url: string): { productId: string; sku?: string } | null {
  const match = url.match(/\/product\/([^/?#]+)/i);
  if (!match) {
    return null;
  }
  const skuMatch = url.match(/[?&]sku=([^&]+)/i);
  return {
    productId: match[1],
    sku: skuMatch?.[1] ? decodeURIComponent(skuMatch[1]) : undefined,
  };
}
