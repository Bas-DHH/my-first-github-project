import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '../server'
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// Define custom type for our Supabase client with cookies
type SupabaseClientWithCookies = SupabaseClient & {
  cookies: {
    get(name: string): Promise<string | undefined>
    set(name: string, value: string, options: CookieOptions): Promise<void>
    remove(name: string, options: CookieOptions): Promise<void>
  }
}

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

// Mock createServerClient
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn().mockImplementation((url: string, key: string, options: { cookies: any }) => ({
    ...options,
    auth: {
      getUser: jest.fn(),
    },
  })),
}))

// Mock console.error to keep test output clean
console.error = jest.fn()

describe('Supabase Server Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a client with cookie handlers', async () => {
    // Mock cookie store with proper types
    const mockCookieStore = {
      get: jest.fn().mockReturnValue({ value: 'test-cookie-value' }),
      getAll: jest.fn(),
      has: jest.fn(),
      size: 0,
      set: jest.fn(),
      [Symbol.iterator]: function* () { yield* [] },
    }
    
    // Mock cookies() to return our mockCookieStore
    jest.mocked(cookies).mockResolvedValue(mockCookieStore as unknown as ReadonlyRequestCookies)

    // Create the client
    const client = (await createClient()) as SupabaseClientWithCookies

    // Test cookie get
    const value = await client.cookies.get('test-cookie')
    expect(mockCookieStore.get).toHaveBeenCalledWith('test-cookie')
    expect(value).toBe('test-cookie-value')

    // Test cookie set with secure options
    const options: CookieOptions = { maxAge: 3600 }
    await client.cookies.set('test-cookie', 'new-value', options)
    expect(mockCookieStore.set).toHaveBeenCalledWith({
      name: 'test-cookie',
      value: 'new-value',
      maxAge: 3600,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    // Test cookie remove
    await client.cookies.remove('test-cookie', options)
    expect(mockCookieStore.set).toHaveBeenCalledWith({
      name: 'test-cookie',
      value: '',
      maxAge: 3600,
      path: '/',
      expires: expect.any(Date),
    })
  })

  it('should handle cookie store initialization errors', async () => {
    // Mock cookies() to throw an error
    jest.mocked(cookies).mockRejectedValue(new Error('Failed to initialize cookie store'))

    // Expect createClient to throw
    await expect(createClient()).rejects.toThrow('Failed to initialize cookie store')
    expect(console.error).toHaveBeenCalledWith('Error initializing cookie store:', expect.any(Error))
  })

  it('should handle cookie operation errors gracefully', async () => {
    // Mock cookie store that throws errors
    const mockCookieStore = {
      get: jest.fn().mockImplementation(() => { throw new Error('Cookie get error') }),
      set: jest.fn().mockImplementation(() => { throw new Error('Cookie set error') }),
      getAll: jest.fn(),
      has: jest.fn(),
      size: 0,
      [Symbol.iterator]: function* () { yield* [] },
    }
    
    jest.mocked(cookies).mockResolvedValue(mockCookieStore as unknown as ReadonlyRequestCookies)

    const client = (await createClient()) as SupabaseClientWithCookies

    // Test get error handling
    const value = await client.cookies.get('test-cookie')
    expect(value).toBeUndefined()
    expect(console.error).toHaveBeenCalledWith('Error accessing cookie:', expect.any(Error))

    // Test set error handling
    await client.cookies.set('test-cookie', 'value', {})
    expect(console.error).toHaveBeenCalledWith('Error setting cookie:', expect.any(Error))

    // Test remove error handling
    await client.cookies.remove('test-cookie', {})
    expect(console.error).toHaveBeenCalledWith('Error removing cookie:', expect.any(Error))
  })
}) 