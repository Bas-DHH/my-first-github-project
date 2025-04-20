-- Create businesses table first (no dependencies)
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view their own business data" ON businesses
  FOR SELECT USING (
    id IN (
      SELECT business_id FROM users WHERE users.id = auth.uid()
    )
  ); 