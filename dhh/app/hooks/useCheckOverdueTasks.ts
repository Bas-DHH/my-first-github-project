import { useState } from 'react'

export function useCheckOverdueTasks() {
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkOverdueTasks = async () => {
    try {
      setIsChecking(true)
      setError(null)

      const response = await fetch('/api/tasks/check-overdue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to check overdue tasks')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check overdue tasks')
      console.error('Error checking overdue tasks:', err)
    } finally {
      setIsChecking(false)
    }
  }

  return {
    checkOverdueTasks,
    isChecking,
    error,
  }
} 