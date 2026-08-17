import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Please enter your full name").max(80),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const addressSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1).max(40).default("Home"),
  fullName: z.string().min(2, "Enter full name"),
  phone: z.string().min(5, "Enter a valid phone number"),
  line1: z.string().min(3, "Enter your street address"),
  line2: z.string().optional().or(z.literal("")),
  city: z.string().min(1, "Enter city"),
  state: z.string().optional().or(z.literal("")),
  postalCode: z.string().min(1, "Enter postal code"),
  country: z.string().min(1).default("Maldives"),
  isDefault: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(5, "Enter a valid phone number"),
  fullName: z.string().min(2, "Enter full name"),
  line1: z.string().min(3, "Enter your street address"),
  line2: z.string().optional().or(z.literal("")),
  city: z.string().min(1, "Enter city"),
  state: z.string().optional().or(z.literal("")),
  postalCode: z.string().min(1, "Enter postal code"),
  country: z.string().min(1, "Enter country"),
  deliveryMethod: z.enum(["STANDARD", "EXPRESS"]),
  paymentMethod: z.enum(["COD", "CARD", "BANK_TRANSFER"]),
  notes: z.string().max(500).optional().or(z.literal("")),
  promoCode: z.string().optional().or(z.literal("")),
  saveAddress: z.boolean().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().nullable().optional(),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1, "Your cart is empty"),
});

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional().or(z.literal("")),
  comment: z.string().min(10, "Share a bit more detail (min 10 characters)").max(2000),
  images: z.array(z.string()).max(5).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email address"),
  subject: z.string().min(2, "Enter a subject"),
  message: z.string().min(10, "Message must be at least 10 characters").max(3000),
});

export const productFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Enter a product name"),
  brandId: z.string().min(1, "Select a brand"),
  categoryId: z.string().min(1, "Select a category"),
  sku: z.string().min(1, "Enter a SKU"),
  shortDescription: z.string().max(300).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  ingredients: z.string().optional().or(z.literal("")),
  howToUse: z.string().optional().or(z.literal("")),
  benefits: z.array(z.string()).optional(),
  skinType: z.array(z.string()).optional(),
  price: z.coerce.number().positive("Enter a valid price"),
  discountPrice: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  lowStockAt: z.coerce.number().int().min(0).default(10),
  productType: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isActive: z.boolean().optional(),
  images: z
    .array(z.object({ url: z.string(), alt: z.string().optional() }))
    .optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        type: z.enum(["shade", "size"]),
        name: z.string().min(1),
        swatch: z.string().optional().or(z.literal("")),
        priceOverride: z.coerce.number().positive().optional().nullable(),
        stock: z.coerce.number().int().min(0).default(0),
      })
    )
    .optional(),
});

export const categoryFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  description: z.string().optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export const brandFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional().or(z.literal("")),
  logo: z.string().optional().or(z.literal("")),
});

export const discountFormSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3).max(30),
  description: z.string().optional().or(z.literal("")),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().positive(),
  minSubtotal: z.coerce.number().min(0).optional().nullable(),
  categoryId: z.string().optional().or(z.literal("")),
  productId: z.string().optional().or(z.literal("")),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export const bannerFormSchema = z.object({
  id: z.string().optional(),
  placement: z.enum(["hero", "promo", "collection"]),
  title: z.string().min(1),
  subtitle: z.string().optional().or(z.literal("")),
  ctaLabel: z.string().optional().or(z.literal("")),
  ctaLink: z.string().optional().or(z.literal("")),
  ctaLabel2: z.string().optional().or(z.literal("")),
  ctaLink2: z.string().optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});
