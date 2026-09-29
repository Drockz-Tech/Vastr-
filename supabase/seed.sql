-- Dummy data for testing the UI without having to manually upload items

-- 1. Create a dummy test user (Wait, Supabase Auth users should be created via API, but we can insert into auth.users if needed, or we just rely on the developer to sign up and then we run seed scripts).
-- For this seed, we assume a user has already signed up and we just need to populate items for an existing user_id.
-- (Replace '00000000-0000-0000-0000-000000000000' with your actual test user's UUID in development)

/*
INSERT INTO items (id, user_id, image_url, category, color, season) VALUES 
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'https://example.com/shirt1.jpg', 'Top', 'White', 'All'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'https://example.com/jeans1.jpg', 'Bottom', 'Blue', 'All'),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'https://example.com/shoes1.jpg', 'Shoes', 'Black', 'All');

INSERT INTO outfits (id, user_id, name) VALUES 
('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'Casual Friday');

INSERT INTO outfit_items (outfit_id, item_id) VALUES 
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111'),
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222'),
('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333');
*/
