# Authentication System

## Overview

DHH uses Supabase Authentication for secure user management. The system supports email/password authentication with plans to add additional providers in the future.

## Implementation Details

### 1. Authentication Flow

```typescript
// Client-side authentication (app/(auth)/login/page.tsx)
const handleLogin = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  // Handle response...
}

// Server-side authentication check (middleware.ts)
const { data: { user } } = await supabase.auth.getUser()
if (!user && isProtectedRoute) {
  // Redirect to login...
}
```

### 2. Protected Routes

All routes under `/dashboard` and `/api` are protected and require authentication:

```typescript
// middleware.ts
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ]
}
```

### 3. User Management

Users are managed through the following interfaces:

```typescript
// Types
interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'staff'
  businessId: string
  createdAt: string
}

// User creation (server-side)
async function createUserProfile(user: Omit<User, 'id' | 'createdAt'>) {
  // Insert user into database...
}
```

## Security Measures

### 1. Cookie Handling

Secure cookie management for authentication:

```typescript
// Server-side cookie handling
const cookieStore = cookies()
createServerClient({
  cookies: {
    get: (name) => cookieStore.get(name)?.value,
    set: (name, value, options) => cookieStore.set({ name, value, ...options }),
    remove: (name) => cookieStore.delete(name)
  }
})
```

### 2. JWT Management

- Tokens are automatically managed by Supabase
- Refresh tokens handled securely
- Session persistence configurable

### 3. CORS & CSRF Protection

- CORS configured for production domain
- CSRF tokens included in requests
- Secure cookie attributes

## User Roles

1. **Business Admin**
   - Create/manage staff users
   - Full access to business data
   - Manage tasks and assignments

2. **Staff User**
   - View assigned tasks
   - Complete task instances
   - Update own profile

## Database Schema

```sql
-- Users table with RLS
create table public.users (
  id uuid references auth.users primary key,
  email text unique not null,
  name text not null,
  role text not null check (role in ('admin', 'staff')),
  business_id uuid references public.businesses not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

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

## API Endpoints

### Authentication Endpoints

```typescript
// Login
POST /api/auth/login
Body: { email: string, password: string }

// Logout
POST /api/auth/logout

// Get current user
GET /api/auth/user
```

### User Management Endpoints

```typescript
// Create user (admin only)
POST /api/users
Body: { email: string, name: string, role: string }

// Update user
PATCH /api/users/:id
Body: { name?: string, email?: string }

// Delete user (admin only)
DELETE /api/users/:id
```

## Error Handling

1. **Authentication Errors**
   - Invalid credentials
   - Session expired
   - Missing permissions

2. **User Management Errors**
   - Duplicate email
   - Invalid role assignment
   - Business association errors

## Testing

```typescript
// Authentication test example
describe('Authentication', () => {
  it('should login user with valid credentials', async () => {
    const response = await signInWithEmail('test@example.com', 'password')
    expect(response.error).toBeNull()
    expect(response.data.user).toBeDefined()
  })
})
```

## Future Enhancements

1. **Additional Auth Providers**
   - Google authentication
   - Microsoft authentication
   - Single Sign-On (SSO)

2. **Advanced Security**
   - Two-factor authentication
   - IP-based access control
   - Session management UI

3. **User Management**
   - Bulk user import
   - User activity logs
   - Password policies 