export interface TeaserItem {
  title: string;
  image: string;
  url: string;
}

export interface ProductSummary {
  name: string;
  id: string;
  image: string;
  startPrice: number;
  url: string;
}

export interface Category {
  key: string;
  name: string;
  products: ProductSummary[];
}

export interface RecommendationItem {
  name: string;
  sku: string;
  image: string;
  url: string;
  rgb?: number[];
}

export interface Store {
  id: string;
  name: string;
  street: string;
  city: string;
  image: string;
}

export interface ExploreHome {
  teaser: TeaserItem[];
  categories: Category[];
}
