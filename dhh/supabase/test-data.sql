-- Use a CTE (WITH clause) to handle the IDs
WITH inserted_business AS (
  INSERT INTO businesses (name)
  VALUES ('Test Business')
  RETURNING id
), inserted_task AS (
  -- Insert user first using the business id from above
  INSERT INTO users (id, email, name, role, business_id)
  SELECT 
    '3346ed93-3aa5-4ab0-b874-a13933ad844e',
    'basgaertman@gmail.com',
    'Test User',
    'admin',
    id
  FROM inserted_business;

  -- Then insert task using the same business id
  INSERT INTO tasks (
    title,
    description,
    category,
    business_id,
    frequency,
    schedule_days
  )
  SELECT
    'Test Temperature Check',
    'Check freezer temperature',
    'temperature_control',
    id,
    'daily',
    '{"days": [1,2,3,4,5]}'::jsonb
  FROM inserted_business
  RETURNING id
)
-- Finally insert the task instance using the task id
INSERT INTO task_instances (
  task_id,
  due_date
)
SELECT 
  id,
  CURRENT_DATE - INTERVAL '1 day'
FROM inserted_task; 