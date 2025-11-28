"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import DataTable, { Column, DataTableAction } from "@/components/ui/table/DataTable";
import type { FilterOption, TableFilters, SortConfig } from "@/components/ui/table/TableFilterBar";
import type { Quiz as ApiQuiz } from "@/types/api";
import { API } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filterValues, setFilterValues] = useState<TableFilters>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', direction: 'DESC' });
  const [locationOptions, setLocationOptions] = useState<Array<{value: string, label: string}>>([]);
  const [serviceOptions, setServiceOptions] = useState<Array<{value: string, label: string}>>([]);

  // Add logging for state changes
  useEffect(() => {
    console.log('📊 filterValues changed:', filterValues);
  }, [filterValues]);

  useEffect(() => {
    console.log('📊 quizzes state changed, count:', quizzes.length);
  }, [quizzes]);

  useEffect(() => {
    console.log('📊 loading state changed:', loading);
  }, [loading]);

  useEffect(() => {
    console.log('📊 locationOptions state changed:', locationOptions);
    console.log('📊 locationOptions length:', locationOptions.length);
  }, [locationOptions]);

  useEffect(() => {
    console.log('📊 serviceOptions state changed:', serviceOptions);
    console.log('📊 serviceOptions length:', serviceOptions.length);
  }, [serviceOptions]);

  const router = useRouter();
  const { canAccessAllQuizzes, isAdmin } = useAuth();



  const loadQuizzes = useCallback(async (filters: TableFilters = {}, sort?: SortConfig, currentPage: number = 1) => {
    console.log('🔄 loadQuizzes called with:', { filters, sort, currentPage });
    console.log('🔄 Filters object keys:', Object.keys(filters));
    console.log('🔄 Filter values:', filters);
    
    setLoading(true);
    setError(null);
    try {
        // Prepare API parameters to match API client structure
      const apiParams = {
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        sort: sort ? {
          field: sort.field,
          direction: sort.direction
        } : undefined,
        page: currentPage,
        limit: 10
      };
      
      console.log('📡 API call params:', JSON.stringify(apiParams, null, 2));
      
      console.log('📡 About to call API.quizzes.getQuizzes with params:', apiParams);
      const res = await API.quizzes.getQuizzes(apiParams);
      console.log('📡 API call completed');
      
      console.log('📥 Raw API response:', res);
      console.log('📥 Raw API response data:', res.data);
      
      const response = res.data as { items?: ApiQuiz[], data?: ApiQuiz[], total?: number, count?: number };
      const quizzesData = response?.items || response?.data || (Array.isArray(res.data) ? res.data : []);
      const totalCount = response?.total || response?.count || (Array.isArray(quizzesData) ? quizzesData.length : 0);
      
      console.log('📥 Processed quiz data:', quizzesData);
      console.log('📥 API response - quiz count:', quizzesData.length);
      console.log('📥 API response - total:', totalCount);
      console.log('📥 First quiz sample:', quizzesData[0]);
      
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
      setTotal(totalCount);
    } catch (err: unknown) {
      console.error('Failed to load quizzes', err);
      setError(err instanceof Error ? err.message : 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConfigOptions = useCallback(async () => {
    console.log('🏢 Loading config options...');
    try {
      // Load location options from backend API
      console.log('🏢 Fetching location configs...');
      const locationRes = await API.config.getConfigsByGroup('location');
      console.log('🏢 Location response:', locationRes);
      console.log('🏢 Location response type:', typeof locationRes);
      console.log('🏢 Location response data type:', typeof locationRes?.data);
      const locationData = locationRes?.data || [];
      console.log('🏢 Location data:', locationData);
      console.log('🏢 Location data length:', locationData?.length);
      console.log('🏢 Location data sample:', locationData[0]);
      
      const locationOpts = Array.isArray(locationData) ? locationData.map((config: { key: string, value: string }, index: number) => {
        console.log(`🏢 Processing location ${index}:`, config);
        return {
          value: config.key,
          label: config.value
        };
      }) : [];
      console.log('🏢 Processed location options:', locationOpts);
      console.log('🏢 Setting locationOptions state with:', locationOpts);
      setLocationOptions(locationOpts);

      // Load service options from backend API
      console.log('🏢 Fetching service configs...');
      const serviceRes = await API.config.getConfigsByGroup('service');
      console.log('🏢 Service response:', serviceRes);
      const serviceData = serviceRes?.data || [];
      console.log('🏢 Service data:', serviceData);
      const serviceOpts = Array.isArray(serviceData) ? serviceData.map((config: { key: string, value: string }) => ({
        value: config.key,
        label: config.value
      })) : [];
      console.log('🏢 Processed service options:', serviceOpts);
      setServiceOptions(serviceOpts);
    } catch (err) {
      console.error('Failed to load config options:', err);
      // If API fails or no data, set empty arrays
      setLocationOptions([]);
      setServiceOptions([]);
    }
  }, []);

  useEffect(() => {
    console.log('🚀 QuizzesPage useEffect triggered');
    console.log('🚀 Current auth state - canAccessAllQuizzes:', canAccessAllQuizzes, 'isAdmin:', isAdmin);
    // Load config options first
    loadConfigOptions();
    // Load quizzes
    loadQuizzes();
  }, [loadQuizzes, loadConfigOptions]);

  const columns: Column[] = [
    {
      key: "title",
      label: "Quiz Title",
      sortable: true,
      render: (value: unknown, row: ApiQuiz) => (
        <div>
          <div className="font-medium text-gray-900">{row.title}</div>
          <div className="text-sm text-gray-500">
            {Array.isArray(row.questions) ? row.questions.length : 0} questions
          </div>
        </div>
      )
    },
    {
      key: "isPublished",
      label: "Status",
      sortable: true,
      render: (value: unknown, row: ApiQuiz) => {
        const isPublished = row.isPublished;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${
            isPublished 
              ? 'from-green-100 to-green-200 text-green-800 border border-green-300' 
              : 'from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300'
          }`}>
            <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
              isPublished ? 'bg-green-400' : 'bg-yellow-400'
            }`}></span>
            {isPublished ? 'Published' : 'Draft'}
          </span>
        );
      }
    },
    {
      key: "questions",
      label: "Questions",
      render: (value: unknown, row: ApiQuiz) => {
        const count = Array.isArray(row.questions) ? row.questions.length : 0;
        return (
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">{count}</div>
            <div className="text-xs text-gray-500">questions</div>
          </div>
        );
      }
    },
    {
      key: "quizType",
      label: "Type",
      sortable: true,
      render: (value: unknown, row: ApiQuiz) => {
        const type = row.quizType || 'Standard';
        return (
          <div className="text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {type}
            </span>
          </div>
        );
      }
    },
    {
      key: "service",
      label: "Service",
      render: (value: unknown, row: ApiQuiz) => {
        // Use service object from quiz data, fallback to serviceKey, then serviceType
        const serviceName = row.service?.value || row.serviceKey || row.serviceType || 'Not Assigned';
        console.log('🔧 Rendering service for quiz:', row.id, 'service:', row.service, 'serviceKey:', row.serviceKey, 'serviceType:', row.serviceType);
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-800">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
            {serviceName}
          </span>
        );
      }
    },
    {
      key: "location",
      label: "Location",
      render: (value: unknown, row: ApiQuiz) => {
        // Use location object from quiz data
        const locationName = row.location?.value || row.locationKey || 'Global';
        console.log('🗺️ Rendering location for quiz:', row.id, 'location:', row.location, 'locationKey:', row.locationKey);
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-green-50 text-green-800">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {locationName}
          </span>
        );
      }
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value: unknown, row: ApiQuiz) => {
        const date = new Date(row.createdAt || '');
        return (
          <div className="text-sm text-gray-600">
            {date.toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'short', 
              day: 'numeric'
            })}
          </div>
        );
      }
    }
  ];

  const actions: DataTableAction[] = [
    {
      label: "Edit",
      onClick: (quiz: ApiQuiz) => handleEdit(quiz),
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      variant: "primary" as const
    },
    {
      label: "Delete",
      onClick: (quiz: ApiQuiz) => handleDelete(quiz),
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      variant: "danger" as const,
      show: () => canAccessAllQuizzes
    }
  ];

  const handleEdit = (quiz: ApiQuiz) => {
    router.push(`/admin/quizzes/${quiz.id}`);
  };

  const handleDelete = (quiz: ApiQuiz) => {
    if (confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
      (async () => {
        try {
          await API.quizzes.deleteQuiz(Number(quiz.id));
          await loadQuizzes();
        } catch (err: unknown) {
          console.error('Delete failed', err);
          alert(err instanceof Error ? err.message : 'Delete failed');
        }
      })();
    }
  };

  // Filter options untuk tabel - using dynamic config data
  const filters: FilterOption[] = useMemo(() => {
    console.log('🔍 Creating filter options with locationOptions:', locationOptions);
    console.log('🔍 locationOptions details:', locationOptions.map(opt => `${opt.value}: ${opt.label}`));
    console.log('🔍 Creating filter options with serviceOptions:', serviceOptions);
    console.log('🔍 serviceOptions details:', serviceOptions.map(opt => `${opt.value}: ${opt.label}`));
    
    const assignedLocationFilter = {
      key: 'assignedLocation',
      label: 'Assigned Location',
      type: 'select',
      placeholder: 'Choose Location',
      options: locationOptions
    };
    
    const assignedServiceFilter = {
      key: 'assignedService',
      label: 'Assigned Service', 
      type: 'select',
      placeholder: 'Choose Service',
      options: serviceOptions
    };
    
    console.log('🔍 assignedLocationFilter:', assignedLocationFilter);
    console.log('🔍 assignedServiceFilter:', assignedServiceFilter);
    
    const filterOptions = [
      {
        key: 'title',
        label: 'Title',
        type: 'text',
        placeholder: 'Search by title...'
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        placeholder: 'Search by description...'
      },
      {
        key: 'isPublished',
        label: 'Status',
        type: 'select',
        placeholder: 'Choose Status',
        options: [
          { value: 'true', label: 'Published' },
          { value: 'false', label: 'Draft' }
        ]
      },
      assignedLocationFilter,
      assignedServiceFilter
    ] as FilterOption[];
    
    console.log('🔍 Final filter options created:', filterOptions);
    console.log('🔍 Location filter in final options:', filterOptions.find(f => f.key === 'assignedLocation'));
    return filterOptions;
  }, [locationOptions, serviceOptions]);

  const handleFilterChange = useCallback((filters: TableFilters) => {
    console.log('🔄 handleFilterChange called');
    console.log('🔄 New filters received:', filters);
    console.log('🔄 Previous filterValues:', filterValues);
    console.log('🔄 Current sortConfig:', sortConfig);
    
    setFilterValues(filters);
    setPage(1); // Reset to first page when filtering
    
    console.log('🔄 About to call loadQuizzes with filters:', filters);
    // Make API call with new filters
    loadQuizzes(filters, sortConfig, 1);
  }, [loadQuizzes, sortConfig, filterValues]);

  const handleSort = useCallback((field: string, direction: 'ASC' | 'DESC') => {
    setSortConfig({ field, direction });
    console.log('Sort:', field, direction);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-600">
          <p className="text-xl mb-4">⚠️ {error}</p>
          <button
            onClick={() => loadQuizzes()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin ? "Manage all quizzes and assessments" : "Manage your assigned quizzes"}
          </p>
        </div>
        
        <div className="flex space-x-3">
          {isAdmin && (
            <button
              onClick={() => router.push('/admin/quizzes/new')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Quiz
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          columns={columns}
          data={quizzes}
          actions={actions}
          filters={filters}
          filterValues={filterValues}
          sortConfig={sortConfig}
          onFilterChange={handleFilterChange}
          onSort={handleSort}
          loading={loading}
          emptyMessage="No quizzes found"
          emptyIcon={
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          }
          pagination={{
            page,
            limit,
            total,
            onPageChange: setPage,
            onLimitChange: handleLimitChange
          }}
          showExport
          onExport={() => console.log('Export quizzes')}
        />
      </div>

      {/* Footer Info */}
      <div className="text-sm text-gray-500 text-center">
        Showing {quizzes.length} of {total} quizzes
      </div>
    </div>
  );
}
