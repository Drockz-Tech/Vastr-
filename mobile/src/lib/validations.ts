import { z } from 'zod';

export const ItemCategoryEnum = z.enum(['Top', 'Bottom', 'Shoes', 'Outerwear', 'Accessory']);
export const SeasonEnum = z.enum(['Spring', 'Summer', 'Fall', 'Winter', 'All']);

/**
 * Validates the payload when creating or updating a wardrobe item.
 * Ensures data integrity before hitting the database.
 */
export const CreateItemSchema = z.object({
  imageUrl: z.string().url("Must be a valid URL"),
  category: ItemCategoryEnum,
  color: z.string().min(2, "Color name is too short").optional(),
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
