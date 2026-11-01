import { z } from 'zod';

export const ItemCategoryEnum = z.enum(['Top', 'Bottom', 'Shoes', 'Outerwear', 'Accessory']);
export const SeasonEnum = z.enum(['Spring', 'Summer', 'Fall', 'Winter', 'All']);

/**
 * Validates the payload when creating or updating a wardrobe item.
 * Ensures data integrity before hitting the database.
 */
export const CreateItemSchema = z.object({
  imagePath: z.string().min(1, "An image is required"),
  category: ItemCategoryEnum,
  color: z.string().trim().min(2, "Color name is too short").max(30).optional(),
  season: SeasonEnum.optional(),
});

export type CreateItemPayload = z.infer<typeof CreateItemSchema>;

/**
 * Validates the payload when creating a new outfit combination.
 */
export const CreateOutfitSchema = z.object({
  name: z.string().max(50, "Name must be under 50 characters").optional(),
  itemIds: z.array(z.string().uuid("Must be valid UUIDs")).min(1, "An outfit must have at least one item"),
});

export type CreateOutfitPayload = z.infer<typeof CreateOutfitSchema>;

export const AuthCredentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type AuthCredentials = z.infer<typeof AuthCredentialsSchema>;

const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const CreateCapsuleSchema = z.object({
  name: z.string().trim().min(1, "Trip name is required").max(80),
  startDate: DateSchema.optional(),
  endDate: DateSchema.optional(),
}).refine(
  ({ startDate, endDate }) => !startDate || !endDate || endDate >= startDate,
  { message: "End date must be on or after the start date", path: ["endDate"] },
);

export type CreateCapsulePayload = z.infer<typeof CreateCapsuleSchema>;
