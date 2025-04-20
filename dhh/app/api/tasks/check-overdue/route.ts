import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Call the function with the authenticated user's context
    const { error } = await supabase.rpc('check_overdue_tasks')
    
    if (error) {
      console.error('Error checking overdue tasks:', error)
      return NextResponse.json(
        { error: 'Failed to check overdue tasks' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Successfully checked overdue tasks' },
      { status: 200 }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 