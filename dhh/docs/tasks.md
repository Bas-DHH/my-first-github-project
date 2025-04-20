# Task System Documentation

## Overview

The DHH task system manages hygiene-related tasks for hospitality businesses. Tasks are category-based with specific form logic for each category. Tasks can be scheduled with different frequencies and assigned to specific users or left open for any staff member.

## Task Categories

### 1. Temperature Control
- Purpose: Monitor and record temperatures of storage units
- Form Fields:
  - Temperature (°C)
  - Optional comment
- Validation:
  - Temperature range: 0-7°C (configurable)
  - Alert if out of range

### 2. Goods Receiving
- Purpose: Check incoming deliveries
- Form Fields:
  - Supplier name
  - Product temperature
  - Issues checkbox
  - Optional comment
- Validation:
  - Temperature range validation
  - Required supplier name

### 3. Critical Cooking Processes
- Purpose: Ensure food safety during cooking
- Form Fields:
  - Food name
  - Temperature
  - Optional comment
- Validation:
  - Minimum temperature ≥75°C
  - Required food name

### 4. Verification of Measurement Devices
- Purpose: Regular device checks
- Form Fields:
  - Device name
  - Verification checkbox
  - Optional comment
- Validation:
  - Required device name
  - Must check verification

### 5. Cleaning Records
- Purpose: Track cleaning activities
- Form Fields:
  - Area cleaned
  - Optional comment
- Validation:
  - Required area name

## Implementation

### Task Creation

```typescript
// Task creation hook (hooks/useTasks.ts)
const createTask = async (taskData: CreateTaskInput) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([taskData])
    .select()
    .single()

  if (error) throw error
  return data
}

// Task form component (components/tasks/TaskForm.tsx)
const TaskForm: React.FC<TaskFormProps> = ({
  category,
  onSubmit,
  initialData,
  disabled
}) => {
  const renderForm = () => {
    switch (category) {
      case 'temperature_control':
        return renderTemperatureControl()
      case 'goods_receiving':
        return renderGoodsReceiving()
      // ... other categories
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {renderForm()}
      <button type="submit" disabled={disabled}>
        Submit
      </button>
    </form>
  )
}
```

### Task Scheduling

```typescript
interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly'
  scheduleDays?: {
    days: number[] // 0-6 for weekly, 1-31 for monthly
  }
}

// Generate task instances
const generateInstances = async (
  taskId: string,
  config: ScheduleConfig
) => {
  const startDate = new Date()
  const endDate = addMonths(startDate, 1) // Generate month ahead

  await supabase.rpc('generate_task_instances', {
    task_id: taskId,
    start_date: startDate,
    end_date: endDate
  })
}
```

### Task Instance Management

```typescript
// Task instance hook (hooks/useTaskInstances.ts)
const useTaskInstances = (taskId: string) => {
  const [instances, setInstances] = useState<TaskInstance[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInstances = async () => {
    const { data, error } = await supabase
      .from('task_instances')
      .select('*')
      .eq('task_id', taskId)
      .order('due_date', { ascending: true })

    if (error) throw error
    setInstances(data)
  }

  const completeInstance = async (
    instanceId: string,
    formData: any
  ) => {
    const { error } = await supabase
      .from('task_instances')
      .update({
        completed_at: new Date(),
        completed_by: user.id,
        data: formData
      })
      .eq('id', instanceId)

    if (error) throw error
    await fetchInstances()
  }

  // ... other methods
}
```

## Task Views

### 1. Today's Tasks

```typescript
// Dashboard component (app/(dashboard)/dashboard/page.tsx)
const DashboardPage = () => {
  const [todaysTasks, setTodaysTasks] = useState<TaskInstance[]>([])

  const fetchTodaysTasks = async () => {
    const { data, error } = await supabase
      .from('task_instances')
      .select(`
        *,
        task:tasks(*)
      `)
      .eq('due_date', new Date().toISOString().split('T')[0])
      .order('is_overdue', { ascending: false })

    if (error) throw error
    setTodaysTasks(data)
  }

  return (
    <div>
      <h1>Today's Tasks</h1>
      <TaskList tasks={todaysTasks} />
    </div>
  )
}
```

### 2. Task Calendar

```typescript
// Calendar component (components/tasks/Calendar.tsx)
const TaskCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [tasks, setTasks] = useState<TaskInstance[]>([])

  const fetchTasksForDate = async (date: Date) => {
    const { data, error } = await supabase
      .from('task_instances')
      .select(`
        *,
        task:tasks(*)
      `)
      .eq('due_date', date.toISOString().split('T')[0])

    if (error) throw error
    setTasks(data)
  }

  return (
    <div>
      <Calendar
        value={selectedDate}
        onChange={(date) => {
          setSelectedDate(date)
          fetchTasksForDate(date)
        }}
      />
      <TaskList tasks={tasks} />
    </div>
  )
}
```

## Task Notifications

### 1. Overdue Tasks

```typescript
// Overdue task check (app/api/tasks/check-overdue/route.ts)
export async function POST() {
  const supabase = createRouteHandlerClient({ cookies })
  await supabase.rpc('check_overdue_tasks')
}

// Scheduled via cron job
select cron.schedule(
  'check-overdue-tasks',
  '0 * * * *', -- Every hour
  $$select check_overdue_tasks()$$
);
```

### 2. Task Reminders (Planned)

```typescript
interface TaskReminder {
  taskInstanceId: string
  userId: string
  reminderTime: Date
  sent: boolean
}

// Future implementation
const sendReminders = async () => {
  const { data: reminders } = await supabase
    .from('task_reminders')
    .select('*')
    .eq('sent', false)
    .lt('reminderTime', new Date())

  for (const reminder of reminders) {
    await sendNotification(reminder)
    await markReminderSent(reminder.id)
  }
}
```

## Error Handling

```typescript
// Task error handling
const handleTaskError = (error: Error) => {
  if (error.message.includes('foreign key constraint')) {
    return 'Invalid task assignment. User may not exist.'
  }
  if (error.message.includes('check constraint')) {
    return 'Invalid task category or frequency.'
  }
  return 'An error occurred while managing the task.'
}

// Form validation
const validateTaskForm = (data: any, category: string) => {
  const errors: Record<string, string> = {}

  switch (category) {
    case 'temperature_control':
      if (data.temperature < 0 || data.temperature > 7) {
        errors.temperature = 'Temperature must be between 0°C and 7°C'
      }
      break
    // ... other categories
  }

  return errors
}
```

## Testing

```typescript
// Task creation test
describe('Task Creation', () => {
  it('should create a task with valid data', async () => {
    const taskData = {
      title: 'Check Fridge Temperature',
      category_id: 'temperature_control',
      frequency: 'daily'
    }

    const { data, error } = await createTask(taskData)
    expect(error).toBeNull()
    expect(data).toHaveProperty('id')
  })
})

// Task completion test
describe('Task Completion', () => {
  it('should complete a task instance', async () => {
    const instanceId = 'test-instance-id'
    const formData = {
      temperature: 5,
      comment: 'All good'
    }

    const { error } = await completeInstance(instanceId, formData)
    expect(error).toBeNull()
  })
})
``` 