'use server'

import { createClient } from '@/app/lib/supabase/server'
import type { Task, TaskInstance } from '@/app/types'

export async function createTask(task: Omit<Task, 'id' | 'createdAt'>) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('tasks')
    .insert([{ ...task, createdAt: new Date().toISOString() }])

  if (error) {
    throw error
  }
}

export async function getTasksByBusiness(businessId: string): Promise<Task[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('businessId', businessId)
    .order('createdAt', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)

  if (error) {
    throw error
  }
}

export async function deleteTask(taskId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    throw error
  }
}

export async function createTaskInstance(instance: Omit<TaskInstance, 'id'>) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('task_instances')
    .insert([instance])

  if (error) {
    throw error
  }
}

export async function getTaskInstancesByTask(taskId: string): Promise<TaskInstance[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('task_instances')
    .select('*')
    .eq('taskId', taskId)
    .order('dueDate', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

export async function completeTaskInstance(instanceId: string, data: Record<string, any>, userId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('task_instances')
    .update({
      completedAt: new Date().toISOString(),
      completedBy: userId,
      data
    })
    .eq('id', instanceId)

  if (error) {
    throw error
  }
} 