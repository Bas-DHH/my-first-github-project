-- Create tasks table (depends on users and businesses)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category_id TEXT NOT NULL,
  business_id UUID NOT NULL,
  assigned_to_user_id UUID REFERENCES users(id),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  schedule_days INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their business tasks"
  ON tasks FOR SELECT
  USING (business_id IN (
    SELECT business_id FROM users WHERE users.id = auth.uid()
  ));

CREATE POLICY "Admins can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update tasks"
  ON tasks FOR UPDATE
  USING (
    business_id IN (
      SELECT business_id FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  ); 