export interface ProductVariant {
  name: string;
  image: string;
  sku: string;
  color: string;
  price: number;
}

export interface ProductDetail {
  name: string;
  id: string;
  category: string;
  highlights: string[];
  variants: ProductVariant[];
}
