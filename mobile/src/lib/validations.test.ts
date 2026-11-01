import { describe, expect, it } from 'vitest';

import {
  AuthCredentialsSchema,
  CreateCapsuleSchema,
  CreateItemSchema,
  CreateOutfitSchema,
} from './validations';

describe('AuthCredentialsSchema', () => {
  it('accepts a valid email and password', () => {
    expect(AuthCredentialsSchema.safeParse({
      email: 'person@example.com',
      password: 'correct horse battery staple',
    }).success).toBe(true);
  });

  it('rejects invalid email and short passwords', () => {
    expect(AuthCredentialsSchema.safeParse({ email: 'not-an-email', password: 'short' }).success).toBe(false);
  });
});

describe('CreateItemSchema', () => {
  it('requires an image and valid category', () => {
    expect(CreateItemSchema.safeParse({ imagePath: 'user/item.jpg', category: 'Top' }).success).toBe(true);
    expect(CreateItemSchema.safeParse({ imagePath: '', category: 'Unknown' }).success).toBe(false);
  });
});

describe('CreateOutfitSchema', () => {
  it('requires at least one UUID item', () => {
    expect(CreateOutfitSchema.safeParse({
      itemIds: ['550e8400-e29b-41d4-a716-446655440000'],
    }).success).toBe(true);
    expect(CreateOutfitSchema.safeParse({ itemIds: [] }).success).toBe(false);
  });
});

describe('CreateCapsuleSchema', () => {
  it('rejects an end date before the start date', () => {
    expect(CreateCapsuleSchema.safeParse({
      name: 'Paris',
      startDate: '2026-06-10',
      endDate: '2026-06-01',
    }).success).toBe(false);
  });

  it('accepts a valid trip range', () => {
    expect(CreateCapsuleSchema.safeParse({
      name: 'Paris',
      startDate: '2026-06-01',
      endDate: '2026-06-10',
    }).success).toBe(true);
  });
});
