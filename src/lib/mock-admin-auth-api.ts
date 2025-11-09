import type { User } from '@/types';

// Mock admin auth API for development/testing when backend is not available
export class MockAdminAuthAPI {
  private static mockUsers: Array<User & { password: string }> = [
    {
      id: "1",
      email: "admin@gms.com",
      name: "Demo Administrator",
      role: "admin",
      password: "admin123",
      createdAt: "2024-01-01T00:00:00Z",
      isActive: true,
    },
    {
      id: "2",
      email: "superadmin@gms.com", 
      name: "Super Admin",
      role: "superadmin",
      password: "super123",
      createdAt: "2024-01-01T00:00:00Z",
      isActive: true,
    }
  ];

  private static generateToken(): string {
    return `mock-jwt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Mock admin login
   */
  static async login(email: string, password: string): Promise<{
    success: boolean;
    data: {
      user: User;
      token: string;
      refreshToken: string;
    };
  }> {
    console.log('MockAdminAuthAPI.login called with:', { email, password });
    await MockAdminAuthAPI.delay(500); // Simulate network delay

    const user = MockAdminAuthAPI.mockUsers.find(u => u.email === email && u.password === password);
    console.log('Mock user found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('Available mock users:', MockAdminAuthAPI.mockUsers.map(u => ({ email: u.email, password: u.password })));
      throw new Error('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user;
    
    const result = {
      success: true,
      data: {
        user: userWithoutPassword,
        token: MockAdminAuthAPI.generateToken(),
        refreshToken: MockAdminAuthAPI.generateToken(),
      },
    };
    
    console.log('Mock login success:', result);
    return result;
  }

  /**
   * Mock get current user profile
   */
  static async getProfile(): Promise<{
    success: boolean;
    data: User;
  }> {
    await MockAdminAuthAPI.delay(200);

    // Simulate token validation
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    
    if (!token || !token.startsWith('mock-jwt-')) {
      throw new Error('Invalid or expired token');
    }

    // Return first mock user for simplicity
    const { password: _, ...user } = MockAdminAuthAPI.mockUsers[0];
    
    return {
      success: true,
      data: user,
    };
  }

  /**
   * Mock refresh JWT token
   */
  static async refreshToken(refreshToken: string): Promise<{
    success: boolean;
    data: {
      token: string;
      refreshToken: string;
    };
  }> {
    await this.delay(300);

    if (!refreshToken || !refreshToken.startsWith('mock-jwt-')) {
      throw new Error('Invalid refresh token');
    }

    return {
      success: true,
      data: {
        token: this.generateToken(),
        refreshToken: this.generateToken(),
      },
    };
  }

  /**
   * Mock change password
   */
  static async changePassword(oldPassword: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
  }> {
    await this.delay(400);

    // Simple validation
    if (oldPassword !== 'admin123') {
      throw new Error('Current password is incorrect');
    }

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  /**
   * Mock logout
   */
  static async logout(): Promise<{
    success: boolean;
    message: string;
  }> {
    await this.delay(200);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  /**
   * Mock validate current session
   */
  static async validateSession(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch {
      return false;
    }
  }
}

// Mock convenience functions
export const mockAdminAuthAPI = {
  login: MockAdminAuthAPI.login,
  getProfile: MockAdminAuthAPI.getProfile,
  refreshToken: MockAdminAuthAPI.refreshToken,
  changePassword: MockAdminAuthAPI.changePassword,
  logout: MockAdminAuthAPI.logout,
  validateSession: MockAdminAuthAPI.validateSession,
};