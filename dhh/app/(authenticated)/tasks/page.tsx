'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useCheckOverdueTasks } from '@/app/hooks/useCheckOverdueTasks'

export default function TasksPage() {
  const { checkOverdueTasks, isChecking, error: checkError } = useCheckOverdueTasks()
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        // Check for overdue tasks when the page loads and we're authenticated
        checkOverdueTasks()
      }
    }

    checkAuth()
  }, []) // Empty dependency array means this runs once when the component mounts

  if (checkError) {
    console.error('Failed to check overdue tasks:', checkError)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tasks</h1>
      {isChecking && (
        <div className="text-gray-600">Checking for overdue tasks...</div>
      )}
      {checkError && (
        <div className="text-red-600">Error checking overdue tasks: {checkError}</div>
      )}
      <div className="space-y-4">
        <p>Task list coming soon...</p>
      </div>
    </div>
  )
} 