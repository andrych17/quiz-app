/**
 * Advanced API Client with Filtering & Sorting Support
 * Based on Quiz App Backend API Documentation
 */

import { TableFilters, SortConfig, PaginationConfig } from "../components/ui/table/TableFilterBar";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  metadata?: {
    duration?: number;
    pagination?: PaginationMeta;
    total?: number;
    count?: number;
  };
  errors?: ValidationError[];
  timestamp: string;
  statusCode: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// User Types with Service/Location Relations
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'user';
  serviceId?: number;
  locationId?: number;
  service?: ConfigItem;
  location?: ConfigItem;
  assignedQuizzes?: Quiz[];
  createdAt: string;
  updatedAt: string;
}

// Quiz Types with Enhanced Relations
export interface Quiz {
  id: number;
  title: string;
  description?: string;
  slug: string;
  token: string;
  quizType: 'scheduled' | 'manual';
  startDateTime?: string;
  endDateTime?: string;
  durationMinutes: number;
  isActive: boolean;
  isPublished: boolean;
  serviceId?: number;
  locationId?: number;
  service?: ConfigItem;
  location?: ConfigItem;
  questions?: Question[];
  scoringTemplates?: QuizScoring[];
  assignedUsers?: User[];
  createdAt: string;
  updatedAt: string;
}

// Question with Images
export interface Question {
  id: number;
  questionText: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  points: number;
  order: number;
  quizId: number;
  images?: QuizImage[];
}

export interface QuizImage {
  id: number;
  questionId: number; // Changed from quizId
  fileName: string;
  originalName: string;
  filePath: string;
  fullUrl: string;
  altText?: string;
  isActive: boolean;
}

export interface QuizScoring {
  id: number;
  scoringName: string;
  correctAnswerPoints: number;
  incorrectAnswerPenalty: number;
  multiplier: number;
  passingScore?: number;
  isActive: boolean;
}

// Config Item for Services/Locations
export interface ConfigItem {
  id: number;
  group: string;
  key: string;
  value: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

// Attempt Types
export interface Attempt {
  id: number;
  participantName: string;
  email: string;
  score: number;
  submittedAt: string;
  quizId: number;
  quiz?: Quiz;
  createdAt: string;
}

// Query Builder Class
export class QueryBuilder {
  private params = new URLSearchParams();

  // Pagination
  page(page: number): this {
    this.params.set('page', page.toString());
    return this;
  }

  limit(limit: number): this {
    this.params.set('limit', limit.toString());
    return this;
  }

  // Search
  search(query: string): this {
    if (query.trim()) {
      this.params.set('search', query.trim());
    }
    return this;
  }

  // Filters
  filter(key: string, value: string | number | boolean): this {
    if (value !== undefined && value !== null && value !== '') {
      this.params.set(key, value.toString());
    }
    return this;
  }

  filters(filters: TableFilters): this {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        this.params.set(key, value.toString());
      }
    });
    return this;
  }

  // Sorting
  sort(config: SortConfig): this {
    if (config.field) {
      this.params.set('sortBy', config.field);
      this.params.set('sortOrder', config.direction);
    }
    return this;
  }

  // Build query string
  build(): string {
    return this.params.toString();
  }

  // Reset
  reset(): this {
    this.params = new URLSearchParams();
    return this;
  }
}

// Enhanced API Client
export class EnhancedApiClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl = 'http://localhost:3001/api') {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
      throw new ApiError(result.message, result.errors, result.statusCode);
    }

    return result;
  }

  // Query builder helper
  query(): QueryBuilder {
    return new QueryBuilder();
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{
      access_token: string;
      user: User;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request<User>('/auth/profile');
  }

  // Users API with Enhanced Filtering & Sorting
  async getUsers(options?: {
    pagination?: Pick<PaginationConfig, 'page' | 'limit'>;
    search?: string;
    filters?: {
      serviceId?: number;
      locationId?: number;
      role?: string;
    };
    sort?: SortConfig;
  }) {
    const query = this.query();

    // Apply pagination
    if (options?.pagination) {
      query.page(options.pagination.page).limit(options.pagination.limit);
    }

    // Apply search
    if (options?.search) {
      query.search(options.search);
    }

    // Apply filters
    if (options?.filters) {
      if (options.filters.serviceId) query.filter('serviceId', options.filters.serviceId);
      if (options.filters.locationId) query.filter('locationId', options.filters.locationId);
      if (options.filters.role) query.filter('role', options.filters.role);
    }

    // Apply sorting
    if (options?.sort) {
      query.sort(options.sort);
    }

    const queryString = query.build();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;

    return this.request<PaginatedResponse<User>>(endpoint);
  }

  async getUser(id: number) {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    serviceId?: number;
    locationId?: number;
  }) {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: number, userData: Partial<User>) {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number) {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Quizzes API with Enhanced Filtering & Sorting
  async getQuizzes(options?: {
    pagination?: Pick<PaginationConfig, 'page' | 'limit'>;
    search?: string;
    filters?: {
      serviceId?: number;
      locationId?: number;
      isActive?: boolean;
    };
    sort?: SortConfig;
  }) {
    const query = this.query();

    // Apply pagination
    if (options?.pagination) {
      query.page(options.pagination.page).limit(options.pagination.limit);
    }

    // Apply search
    if (options?.search) {
      query.search(options.search);
    }

    // Apply filters
    if (options?.filters) {
      if (options.filters.serviceId) query.filter('serviceId', options.filters.serviceId);
      if (options.filters.locationId) query.filter('locationId', options.filters.locationId);
      if (options.filters.isActive !== undefined) query.filter('isActive', options.filters.isActive);
    }

    // Apply sorting
    if (options?.sort) {
      query.sort(options.sort);
    }

    const queryString = query.build();
    const endpoint = `/quizzes${queryString ? `?${queryString}` : ''}`;

    return this.request<PaginatedResponse<Quiz>>(endpoint);
  }

  async getQuiz(id: number) {
    return this.request<Quiz>(`/quizzes/${id}`);
  }

  async createQuiz(quizData: {
    title: string;
    description?: string;
    quizType: 'scheduled' | 'manual';
    startDateTime?: string;
    endDateTime?: string;
    durationMinutes: number;
    serviceId?: number;
    locationId?: number;
  }) {
    return this.request<Quiz>('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }

  async updateQuiz(id: number, quizData: Partial<Quiz>) {
    return this.request<Quiz>(`/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quizData),
    });
  }

  async deleteQuiz(id: number) {
    return this.request<void>(`/quizzes/${id}`, {
      method: 'DELETE',
    });
  }

  // Config API for Services/Locations
  async getConfigItems(options?: {
    pagination?: Pick<PaginationConfig, 'page' | 'limit'>;
    filters?: {
      group?: string;
    };
    sort?: SortConfig;
  }) {
    const query = this.query();

    if (options?.pagination) {
      query.page(options.pagination.page).limit(options.pagination.limit);
    }

    if (options?.filters?.group) {
      query.filter('group', options.filters.group);
    }

    if (options?.sort) {
      query.sort(options.sort);
    } else {
      // Default sorting for config items
      query.sort({ field: 'group', direction: 'ASC' });
    }

    const queryString = query.build();
    const endpoint = `/config${queryString ? `?${queryString}` : ''}`;

    return this.request<PaginatedResponse<ConfigItem>>(endpoint);
  }

  async getServices() {
    return this.request<ConfigItem[]>('/config/services');
  }

  async getLocations() {
    return this.request<ConfigItem[]>('/config/locations');
  }

  async getConfigByGroup(group: string) {
    return this.request<ConfigItem[]>(`/config/group/${group}`);
  }

  // Attempts API with Enhanced Filtering & Sorting
  async getAttempts(options?: {
    pagination?: Pick<PaginationConfig, 'page' | 'limit'>;
    filters?: {
      quizId?: number;
      email?: string;
    };
    sort?: SortConfig;
  }) {
    const query = this.query();

    if (options?.pagination) {
      query.page(options.pagination.page).limit(options.pagination.limit);
    }

    if (options?.filters) {
      if (options.filters.quizId) query.filter('quizId', options.filters.quizId);
      if (options.filters.email) query.filter('email', options.filters.email);
    }

    if (options?.sort) {
      query.sort(options.sort);
    }

    const queryString = query.build();
    const endpoint = `/attempts${queryString ? `?${queryString}` : ''}`;

    return this.request<PaginatedResponse<Attempt>>(endpoint);
  }

  async getAttempt(id: number) {
    return this.request<Attempt>(`/attempts/${id}`);
  }
}

// Error Class
export class ApiError extends Error {
  constructor(
    message: string,
    public errors?: ValidationError[],
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }

  getFieldErrors(): Record<string, string> {
    if (!this.errors) return {};
    
    return this.errors.reduce((acc, error) => {
      acc[error.field] = error.message;
      return acc;
    }, {} as Record<string, string>);
  }
}

// Create singleton instance
export const api = new EnhancedApiClient();

// Export for use in components
export default api;