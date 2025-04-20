'use server'

import { createClient } from '@/app/lib/supabase/server'
import type { User } from '@/app/types'

export async function signInWithEmail(email: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}${process.env.NEXT_PUBLIC_AUTH_REDIRECT}`,
    },
  })

  if (error) {
    throw error
  }
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw error
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return null
  }

  return profile
}

export async function getUserProfile(userId: string): Promise<User | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)

  if (error) {
    throw error
  }
}

export async function createUserProfile(user: Omit<User, 'id' | 'createdAt'>) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('users')
    .insert([{ ...user, createdAt: new Date().toISOString() }])

  if (error) {
    throw error
  }
}

interface InviteUserData {
  name: string
  email: string
  role: 'admin' | 'staff'
}

export async function inviteUser({ name, email, role }: InviteUserData) {
  const supabase = await createClient()

  // Generate a temporary password
  const tempPassword = Math.random().toString(36).slice(-8)

  // Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  })

  if (authError) {
    throw authError
  }

  // Create the user profile
  const { error: profileError } = await supabase
    .from('users')
    .insert([
      {
        id: authData.user.id,
        name,
        email,
        role,
        business_id: null, // Will be set by admin later
        created_at: new Date().toISOString(),
      },
    ])

  if (profileError) {
    // Clean up auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id)
    throw profileError
  }

  // Send welcome email with temporary password
  const { error: emailError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: {
        tempPassword,
        name,
      },
    },
  })

  if (emailError) {
    // Clean up both auth user and profile if email fails
    await supabase.auth.admin.deleteUser(authData.user.id)
    await supabase.from('users').delete().eq('id', authData.user.id)
    throw emailError
  }

  return { success: true }
} 