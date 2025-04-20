-- Create task_instances table (depends on tasks and users)
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

-- Enable RLS
ALTER TABLE task_instances ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their business task instances"
  ON task_instances FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE business_id IN (
        SELECT business_id FROM users WHERE users.id = auth.uid()
      )
    )
  );

CREATE POLICY "Staff can complete task instances"
  ON task_instances FOR UPDATE
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE business_id IN (
        SELECT business_id FROM users WHERE users.id = auth.uid()
      )
    )
  );

-- Create function to mark tasks as overdue
CREATE OR REPLACE FUNCTION update_overdue_tasks()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE task_instances
  SET is_overdue = TRUE
  WHERE completed_at IS NULL
    AND due_date < NOW()
    AND is_overdue = FALSE;
END;
$$;

-- Create a cron job to run every hour
SELECT cron.schedule(
  'update-overdue-tasks',
  '0 * * * *', -- Every hour
  'SELECT update_overdue_tasks();'
); 