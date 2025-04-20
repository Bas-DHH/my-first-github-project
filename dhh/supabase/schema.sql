-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  business_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

-- Create businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create tasks table
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

-- Create task_instances table
CREATE TABLE task_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES users(id),
  is_overdue BOOLEAN DEFAULT FALSE,
  data JSONB,
  comment TEXT,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_instances ENABLE ROW LEVEL SECURITY;

-- Users can read their own business's data
CREATE POLICY "Users can view their own business data" ON businesses
  FOR SELECT USING (
    id IN (
      SELECT business_id FROM users WHERE users.id = auth.uid()
    )
  );

-- Users can read their own business's tasks
CREATE POLICY "Users can view their business tasks" ON tasks
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM users WHERE users.id = auth.uid()
    )
  );

-- Users can read their own business's task instances
CREATE POLICY "Users can view their business task instances" ON task_instances
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM tasks WHERE business_id IN (
        SELECT business_id FROM users WHERE users.id = auth.uid()
      )
    )
  );

-- Staff can complete task instances
CREATE POLICY "Staff can complete task instances" ON task_instances
  FOR UPDATE USING (
    task_id IN (
      SELECT id FROM tasks WHERE business_id IN (
        SELECT business_id FROM users WHERE users.id = auth.uid()
      )
    )
  ); 