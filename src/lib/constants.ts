export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export const REVIEW_STATUSES = ["PENDING", "APPROVED", "HIDDEN"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const DISCOUNT_TYPES = ["PERCENTAGE", "FIXED"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export const DELIVERY_METHODS = [
  { id: "STANDARD", label: "Standard Delivery", description: "4–6 business days", price: 4.5 },
  { id: "EXPRESS", label: "Express Delivery", description: "1–2 business days", price: 12 },
] as const;

export const PAYMENT_METHODS = [
  { id: "COD", label: "Cash on Delivery" },
  { id: "CARD", label: "Credit / Debit Card" },
  { id: "BANK_TRANSFER", label: "Bank Transfer" },
] as const;

export const FREE_SHIPPING_THRESHOLD = 75;

export const CATEGORY_DEFS = [
  { name: "Makeup", slug: "makeup", icon: "sparkles" },
  { name: "Skincare", slug: "skincare", icon: "droplet" },
  { name: "Haircare", slug: "haircare", icon: "wind" },
  { name: "Fragrance", slug: "fragrance", icon: "flower" },
  { name: "Body Care", slug: "body-care", icon: "sun" },
  { name: "Beauty Tools", slug: "tools", icon: "wand" },
] as const;

export const SKIN_TYPES = ["Normal", "Dry", "Oily", "Combination", "Sensitive", "All Skin Types"];

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number]["value"];
