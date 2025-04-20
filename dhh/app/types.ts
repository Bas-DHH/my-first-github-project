export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff'
  businessId: string | null
  createdAt: string
}

export interface Business {
  id: string
  name: string
  createdAt: string
} 