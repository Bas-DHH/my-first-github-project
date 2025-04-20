'use server'

import { createClient } from '@/app/lib/supabase/server'
import type { User } from '@/app/types'

interface DbUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff'
  business_id: string | null
  created_at: string
}

// Transform database user to frontend user
export function transformUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    businessId: dbUser.business_id || '',
    createdAt: dbUser.created_at,
  }
}

export async function getBusinessUsers(businessId: string): Promise<User[]> {
  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('business_id', businessId)
    .order('name')

  if (error) {
    throw error
  }

  return users.map(transformUser)
}

export async function updateUserRole(userId: string, newRole: 'admin' | 'staff') {
  const supabase = await createClient()

  // First check if the user making the request is an admin
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) {
    throw new Error('Not authenticated')
  }

  const { data: adminProfile, error: adminError } = await supabase
    .from('users')
    .select('role, business_id')
    .eq('id', currentUser.id)
    .single()

  if (adminError || !adminProfile) {
    throw new Error('Failed to verify admin status')
  }

  if (adminProfile.role !== 'admin') {
    throw new Error('Not authorized')
  }

  // Check if the target user is in the same business
  const { data: targetUser, error: targetError } = await supabase
    .from('users')
    .select('business_id')
    .eq('id', userId)
    .single()

  if (targetError || !targetUser) {
    throw new Error('User not found')
  }

  if (targetUser.business_id !== adminProfile.business_id) {
    throw new Error('Cannot modify users from other businesses')
  }

  // Update the user's role
  const { error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    throw error
  }
}

export async function getCurrentUserBusiness() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('business_id, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('Failed to get user profile')
  }

  return {
    businessId: profile.business_id,
    role: profile.role,
  }
} 