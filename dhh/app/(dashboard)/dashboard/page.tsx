'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Task } from '@/app/types'
import { getCurrentUser } from '@/app/services/auth'
import { getTasksByBusiness } from '@/app/services/tasks'

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/login')
          return
        }

        if (!user.businessId) {
          setError('No business associated with your account. Please contact your administrator.')
          return
        }

        // Fetch tasks for the user's business
        const businessTasks = await getTasksByBusiness(user.businessId)
        setTasks(businessTasks)
      } catch (error) {
        console.error('Error loading dashboard:', error)
        setError('An error occurred while loading your tasks.')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Tasks</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold mb-2">{task.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {task.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded">
                {task.categoryId}
              </span>
              <button
                onClick={() => router.push(`/tasks/${task.id}`)}
                className="text-sm text-primary hover:text-primary/80"
              >
                View Details →
              </button>
            </div>
          </div>
        ))}

        {tasks.length === 0 && !error && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No tasks found. Create your first task to get started.
          </div>
        )}
      </div>
    </div>
  )
} 