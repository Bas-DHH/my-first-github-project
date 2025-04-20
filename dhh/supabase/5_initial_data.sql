-- Insert your first business
INSERT INTO businesses (name) 
VALUES ('My First Business')
RETURNING id;

-- After running the above, copy the returned business ID and replace it in the query below
-- Also replace 'your-auth-user-id' with your actual auth.users id from Supabase
INSERT INTO users (
  id,
  email,
  name,
  role,
  business_id
)
VALUES (
  'your-auth-user-id',  -- Replace with your auth.users id
  'your-email@example.com',  -- Replace with your email
  'Admin User',
  'admin',
  'business-id-from-above'  -- Replace with the business ID from the first query
); 