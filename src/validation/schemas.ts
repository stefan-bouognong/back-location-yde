import { z } from "zod";

export const userRoleSchema = z.enum(["visitor", "user", "owner"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const propertyTypeSchema = z.enum(["room", "studio", "apartment"]);
export const propertyStyleSchema = z.enum(["simple", "modern"]);
export const furnishedSchema = z.enum(["furnished", "unfurnished"]);
export const sortBySchema = z.enum(["price-asc", "price-desc", "newest"]);

const httpsUrl = z.string().url().refine((u) => u.startsWith("https:"), {
  message: "Image URLs must use HTTPS",
});

export const registerBodySchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().min(1).max(50),
  password: z.string().min(6).max(128),
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const featuresSchema = z.object({
  water: z.boolean(),
  electricity: z.boolean(),
  wifi: z.boolean(),
  parking: z.boolean(),
  security: z.boolean(),
  kitchen: z.boolean(),
});

const propertyBaseSchema = z.object({
  title: z.string().min(1).max(500),
  type: propertyTypeSchema,
  style: propertyStyleSchema,
  furnished: furnishedSchema,
  price: z.coerce.number().int().positive().max(2_000_000_000),
  location: z.string().min(1).max(255).default("Yaoundé"),
  neighborhood: z.string().min(1).max(255),
  description: z.string().min(1),
  features: featuresSchema,
  isFeatured: z.boolean().optional(),
  images: z.array(httpsUrl).min(1).max(20),
});

export const createPropertySchema = propertyBaseSchema;

export const updatePropertySchema = propertyBaseSchema.partial().extend({
  images: z.array(httpsUrl).min(1).max(20).optional(),
});

const emptyToUndef = (v: unknown) => (v === "" || v === undefined ? undefined : v);

export const listPropertiesQuerySchema = z.object({
  neighborhood: z.preprocess(emptyToUndef, z.string().min(1).optional()),
  location: z.preprocess(emptyToUndef, z.string().min(1).optional()),
  type: z.preprocess(emptyToUndef, propertyTypeSchema.optional()),
  furnished: z.preprocess(emptyToUndef, furnishedSchema.optional()),
  priceMin: z.coerce.number().int().min(0).optional(),
  priceMax: z.coerce.number().int().min(0).optional(),
  sortBy: sortBySchema.optional().default("newest"),
});
