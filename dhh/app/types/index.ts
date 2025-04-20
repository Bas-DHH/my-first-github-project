export type UserRole = 'admin' | 'staff'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  businessId: string
  createdAt: string
}

export interface Business {
  id: string
  name: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  categoryId: string
  businessId: string
  assignedToUserId?: string
  frequency: 'daily' | 'weekly' | 'monthly'
  scheduleDays?: number[] // For weekly/monthly tasks
  createdAt: string
}

export interface TaskInstance {
  id: string
  taskId: string
  dueDate: string
  completedAt?: string
  completedBy?: string
  isOverdue: boolean
  data?: Record<string, any>
  comment?: string
} 