# Database Schema Documentation

## Overview

DHH uses Supabase (PostgreSQL) as its database with Row Level Security (RLS) policies to ensure data isolation between businesses and proper access control.

## Tables

### 1. Businesses

```sql
create table public.businesses (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.businesses enable row level security;

create policy "Users can view their own business"
  on public.businesses for select
  using (
    id in (
      select business_id from public.users
      where users.id = auth.uid()
    )
  );

create policy "Admins can update their business"
  on public.businesses for update
  using (
    id in (
      select business_id from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );
```

### 2. Users

```sql
create table public.users (
  id uuid references auth.users primary key,
  email text unique not null,
  name text not null,
  role text not null check (role in ('admin', 'staff')),
  business_id uuid references public.businesses not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can view colleagues in same business"
  on public.users for select
  using (
    business_id in (
      select business_id from public.users
      where users.id = auth.uid()
    )
  );

create policy "Admins can manage users in their business"
  on public.users for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role = 'admin'
      and business_id = users.business_id
    )
  );
```

### 3. Tasks

```sql
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  category_id text not null check (category_id in (
    'temperature_control',
    'goods_receiving',
    'cooking_processes',
    'measurement_devices',
    'cleaning_records'
  )),
  business_id uuid references public.businesses not null,
  assigned_to_user_id uuid references public.users,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly')),
  schedule_days jsonb, -- For weekly/monthly tasks
  created_by uuid references public.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.tasks enable row level security;

create policy "Users can view tasks in their business"
  on public.tasks for select
  using (
    business_id in (
      select business_id from public.users
      where users.id = auth.uid()
    )
  );

create policy "Admins can manage tasks in their business"
  on public.tasks for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role = 'admin'
      and business_id = tasks.business_id
    )
  );
```

### 4. Task Instances

```sql
create table public.task_instances (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks not null,
  due_date date not null,
  completed_at timestamp with time zone,
  completed_by uuid references public.users,
  is_overdue boolean default false,
  data jsonb, -- Category-specific form data
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.task_instances enable row level security;

create policy "Users can view task instances in their business"
  on public.task_instances for select
  using (
    exists (
      select 1 from public.tasks
      where tasks.id = task_instances.task_id
      and tasks.business_id in (
        select business_id from public.users
        where users.id = auth.uid()
      )
    )
  );

create policy "Users can complete task instances in their business"
  on public.task_instances for update
  using (
    exists (
      select 1 from public.tasks
      where tasks.id = task_instances.task_id
      and tasks.business_id in (
        select business_id from public.users
        where users.id = auth.uid()
      )
    )
  );
```

## Functions

### 1. Check Overdue Tasks

```sql
create or replace function check_overdue_tasks()
returns void
language plpgsql
security definer
as $$
begin
  update public.task_instances
  set is_overdue = true
  where completed_at is null
    and due_date < current_date;
end;
$$;

-- Schedule function to run every hour
select cron.schedule(
  'check-overdue-tasks',
  '0 * * * *',
  $$select check_overdue_tasks()$$
);
```

### 2. Generate Task Instances

```sql
create or replace function generate_task_instances(task_id uuid, start_date date, end_date date)
returns void
language plpgsql
security definer
as $$
declare
  v_task public.tasks;
  v_date date;
begin
  -- Get task details
  select * into v_task from public.tasks where id = task_id;
  
  -- Generate instances based on frequency
  v_date := start_date;
  while v_date <= end_date loop
    -- Check if instance should be created based on schedule
    if (
      v_task.frequency = 'daily'
      or (v_task.frequency = 'weekly' and (v_task.schedule_days->>'days')::jsonb ? extract(dow from v_date)::text)
      or (v_task.frequency = 'monthly' and (v_task.schedule_days->>'days')::jsonb ? extract(day from v_date)::text)
    ) then
      insert into public.task_instances (task_id, due_date)
      values (task_id, v_date)
      on conflict do nothing;
    end if;
    
    v_date := v_date + 1;
  end loop;
end;
$$;
```

## Indexes

```sql
-- Users
create index users_business_id_idx on public.users(business_id);
create index users_role_idx on public.users(role);

-- Tasks
create index tasks_business_id_idx on public.tasks(business_id);
create index tasks_category_id_idx on public.tasks(category_id);
create index tasks_assigned_to_user_id_idx on public.tasks(assigned_to_user_id);

-- Task Instances
create index task_instances_task_id_idx on public.task_instances(task_id);
create index task_instances_due_date_idx on public.task_instances(due_date);
create index task_instances_completed_by_idx on public.task_instances(completed_by);
create index task_instances_is_overdue_idx on public.task_instances(is_overdue);
```

## Triggers

```sql
-- Update timestamps
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger update_businesses_updated_at
  before update on public.businesses
  for each row execute function update_updated_at();

create trigger update_users_updated_at
  before update on public.users
  for each row execute function update_updated_at();

create trigger update_tasks_updated_at
  before update on public.tasks
  for each row execute function update_updated_at();

create trigger update_task_instances_updated_at
  before update on public.task_instances
  for each row execute function update_updated_at();
```

## Data Types

### Category-specific Form Data

```typescript
// Temperature Control
interface TemperatureControlData {
  temperature: number;
  comment?: string;
}

// Goods Receiving
interface GoodsReceivingData {
  supplier: string;
  temperature: number;
  hasIssues: boolean;
  comment?: string;
}

// Cooking Processes
interface CookingProcessData {
  foodName: string;
  temperature: number;
  comment?: string;
}

// Measurement Devices
interface MeasurementDeviceData {
  deviceName: string;
  isVerified: boolean;
  comment?: string;
}

// Cleaning Records
interface CleaningRecordData {
  area: string;
  comment?: string;
}
``` 