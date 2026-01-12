export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  isActive?: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  title: string;
  description: string;
  selling_price: number;
  discount_percentage?: number;
  on_sale?: boolean;
  sale_discount_percentage?: number;
  usp_tag?: string;
  main_image_url: string;
  mockup_images?: string[];
  mockup_video_url?: string;
  rating?: number;
  rating_count?: number;
  review_count?: number;
  variants: {
    sizes: string[];
    colors: string[];
  };
  variants_with_mockups?: Record<string, string[]>; // Mockup images organized by color: { color: [url1, url2, ...] }
  created_at?: string;
  updated_at?: string;
  // Legacy fields for backward compatibility (computed)
  name?: string; // alias for title
  price?: number; // computed: selling_price * (1 - discount_percentage/100) * (1 - sale_discount_percentage/100) if on_sale
  originalPrice?: number; // alias for selling_price
  imageUrl?: string; // alias for main_image_url
  category?: string; // category slug (from join)
  tags?: string[]; // computed from usp_tag
  reviewCount?: number; // alias for review_count
  discount?: string; // computed: "Save $X" (cumulative discount)
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export type Page = 
  | { name: 'home' }
  | { name: 'categories' }
  | { name: 'category'; slug: string }
  | { name: 'product'; id: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'login' }
  | { name: 'admin' }
  | { name: 'order-success' }
  | { name: 'about' }
  | { name: 'contact' }
  | { name: 'best-sellers' }
  | { name: 'new-arrivals' }
  | { name: 'sale' }
  | { name: 'faq' }
  | { name: 'shipping' }
  | { name: 'returns' }
  | { name: 'size-guide' }
  | { name: 'custom-design' };

