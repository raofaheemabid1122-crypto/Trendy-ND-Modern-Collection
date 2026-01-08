
export type Gender = 'Men' | 'Women';
export type Season = 'Summer' | 'Winter';
export type Fabric = 'Lawn' | 'Cotton' | 'Khaddar' | 'Karandi' | 'Pashmina' | 'Silk' | 'Wool';
export type Occasion = 'Casual' | 'Festive' | 'Bridal';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  gender: Gender;
  season: Season;
  fabric: Fabric;
  occasion: Occasion;
  color: string;
  image: string; // Featured image
  images: string[]; // Additional gallery images
  description: string;
  whatsIncluded: string[];
  fabricCare: string[];
  isNew?: boolean;
  isSale?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
