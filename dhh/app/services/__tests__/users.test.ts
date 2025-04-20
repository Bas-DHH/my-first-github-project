/** @jest-environment node */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { transformUser, getBusinessUsers, updateUserRole, getCurrentUserBusiness } from '../users';
import { createClient } from '../../../app/lib/supabase/server';
import type { User, Business } from '../../types';
import { SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '../../types/database.types';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    getAll: jest.fn(),
  })),
}));

// Mock @supabase/ssr
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

type DbUser = Database['public']['Tables']['users']['Row'];
type DbBusiness = Database['public']['Tables']['businesses']['Row'];

describe('User Service', () => {
  const mockDbUser = {
    id: '123',
    email: 'test@example.com',
    name: 'John Doe',
    business_id: 'business123',
    role: 'staff' as 'admin' | 'staff',
    created_at: '2024-01-01T00:00:00Z'
  };

  const mockTransformedUser = {
    id: '123',
    email: 'test@example.com',
    name: 'John Doe',
    businessId: 'business123',
    role: 'staff' as 'admin' | 'staff',
    createdAt: '2024-01-01T00:00:00Z'
  };

  let mockSupabaseClient: jest.Mocked<SupabaseClient<Database>>;
  let mockCookies: ReturnType<typeof cookies>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock Supabase client
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn(),
      }),
    } as unknown as jest.Mocked<SupabaseClient<Database>>;

    (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    // Setup mock cookies
    mockCookies = {
      get: jest.fn(),
      set: jest.fn(),
      getAll: jest.fn(),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookies);
  });

  describe('transformUser', () => {
    it('should transform database user to frontend user format', () => {
      const result = transformUser(mockDbUser);
      expect(result).toEqual(mockTransformedUser);
    });

    it('should handle null values', () => {
      const nullUser = {
        ...mockDbUser,
        name: ''
      };
      const result = transformUser(nullUser);
      expect(result.name).toBe('');
    });
  });

  describe('getBusinessUsers', () => {
    it('should fetch users for a business', async () => {
      const mockSelect = jest.fn().mockResolvedValue({ data: [mockDbUser], error: null });
      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect,
        order: jest.fn().mockReturnThis()
      });

      const mockSupabase = {
        from: mockFrom,
        auth: { getUser: jest.fn() }
      };

      (require('@supabase/ssr').createServerClient as jest.Mock).mockReturnValue(mockSupabase);

      const result = await getBusinessUsers('business123');
      
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(result).toEqual([mockTransformedUser]);
    });

    it('should handle errors when fetching users', async () => {
      const mockError = new Error('Database error');
      const mockSelect = jest.fn().mockResolvedValue({ data: null, error: mockError });
      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect,
        order: jest.fn().mockReturnThis()
      });

      const mockSupabase = {
        from: mockFrom,
        auth: { getUser: jest.fn() }
      };

      (require('@supabase/ssr').createServerClient as jest.Mock).mockReturnValue(mockSupabase);

      await expect(getBusinessUsers('business123')).rejects.toThrow(mockError);
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({
        data: { user: { id: '123' } },
        error: null
      });

      const mockSelect = jest.fn().mockResolvedValue({
        data: { role: 'admin', business_id: 'business123' },
        error: null
      });

      const mockUpdate = jest.fn().mockResolvedValue({ error: null });
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockReturnThis();

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect,
        update: mockUpdate,
        eq: mockEq,
        single: mockSingle
      });

      const mockSupabase = {
        from: mockFrom,
        auth: { getUser: mockGetUser }
      };

      (require('@supabase/ssr').createServerClient as jest.Mock).mockReturnValue(mockSupabase);

      await updateUserRole('456', 'staff');

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockUpdate).toHaveBeenCalledWith({ role: 'staff' });
    });

    it('should handle errors when updating role', async () => {
      const mockGetUser = jest.fn().mockResolvedValue({
        data: { user: { id: '123' } },
        error: null
      });

      const mockSelect = jest.fn().mockResolvedValue({
        data: { role: 'admin', business_id: 'business123' },
        error: null
      });

      const mockUpdate = jest.fn().mockResolvedValue({ error: new Error('Update failed') });
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockReturnThis();

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect,
        update: mockUpdate,
        eq: mockEq,
        single: mockSingle
      });

      const mockSupabase = {
        from: mockFrom,
        auth: { getUser: mockGetUser }
      };

      (require('@supabase/ssr').createServerClient as jest.Mock).mockReturnValue(mockSupabase);

      await expect(updateUserRole('456', 'staff')).rejects.toThrow('Update failed');
    });
  });

  describe('getCurrentUserBusiness', () => {
    const mockCookies = {
      get: jest.fn(),
      getAll: jest.fn(),
    } as unknown as ReadonlyRequestCookies;

    const mockSupabase = {
      from: jest.fn(),
      auth: {
        getUser: jest.fn(),
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (cookies as jest.Mock).mockReturnValue(mockCookies);
      (createClient as jest.Mock).mockReturnValue(mockSupabase);
    });

    it('should return user business info when authenticated', async () => {
      const mockProfile = {
        business_id: 'business123',
        role: 'admin' as const,
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null,
      });

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await getCurrentUserBusiness();

      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('business_id, role');
      expect(mockEq).toHaveBeenCalledWith('id', 'user123');
      expect(result).toEqual({
        businessId: mockProfile.business_id,
        role: mockProfile.role,
      });
    });

    it('should throw error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      await expect(getCurrentUserBusiness()).rejects.toThrow('Not authenticated');
    });

    it('should throw error when profile not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null,
      });

      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Profile not found'),
      });

      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      await expect(getCurrentUserBusiness()).rejects.toThrow('Failed to get user profile');
    });
  });
});
