"use client";

import { useState } from "react";

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select';
  filterOptions?: { value: string; label: string }[];
  render?: (value: any, row: any) => React.ReactNode;
}

export interface DataTableProps {
  columns: Column[];
  data: any[];
  searchable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onRowClick?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  loading?: boolean;
}

export default function DataTable({
  columns,
  data,
  searchable = true,
  sortable = true,
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  onRowClick,
  onEdit,
  onDelete,
  loading = false
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Handle column filter changes
  const handleColumnFilterChange = (columnKey: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Clear all filters
  const clearAllFilters = () => {
    setColumnFilters({});
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Filter data based on search term and column filters
  const filteredData = data.filter(row => {
    // Global search filter
    const matchesSearch = searchTerm === "" || Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Column-specific filters
    const matchesColumnFilters = Object.entries(columnFilters).every(([columnKey, filterValue]) => {
      if (!filterValue) return true;
      const cellValue = String(row[columnKey]).toLowerCase();
      return cellValue.includes(filterValue.toLowerCase());
    });

    return matchesSearch && matchesColumnFilters;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setCurrentPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / currentPageSize);
  const startIndex = (currentPage - 1) * currentPageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + currentPageSize);

  const handleSort = (column: string) => {
    if (!sortable) return;
    
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Modern Header with Search and Controls */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <div className="p-6">
          {/* Top Controls Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search Section */}
            {searchable && (
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search across all columns..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setCurrentPage(1);
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              {/* Results Info */}
              <div className="text-sm text-gray-600 hidden sm:block">
                {sortedData.length} {sortedData.length === 1 ? 'result' : 'results'}
                {(searchTerm || Object.values(columnFilters).some(v => v)) && (
                  <span className="text-blue-600 font-medium"> (filtered)</span>
                )}
              </div>

              {/* Page Size Selector */}
              {pagination && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600 whitespace-nowrap">Show:</label>
                  <select
                    value={currentPageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    {pageSizeOptions.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-600 whitespace-nowrap">per page</span>
                </div>
              )}
              
              {/* Filter Toggle */}
              {columns.some(col => col.filterable) && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-all ${
                    showFilters || Object.values(columnFilters).some(v => v)
                      ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' 
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586l-4-2v-2.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                  {Object.values(columnFilters).filter(v => v).length > 0 && (
                    <span className="ml-1.5 bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">
                      {Object.values(columnFilters).filter(v => v).length}
                    </span>
                  )}
                </button>
              )}
              
              {/* Clear All Filters */}
              {(Object.values(columnFilters).some(v => v) || searchTerm) && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                >
                  <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear
                </button>
              )}
            </div>
          </div>
          
          {/* Advanced Filters Panel */}
          {showFilters && columns.some(col => col.filterable) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Advanced Filters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {columns.filter(col => col.filterable).map((column) => (
                  <div key={column.key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {column.label}
                    </label>
                    {column.filterType === 'select' && column.filterOptions ? (
                      <select
                        value={columnFilters[column.key] || ""}
                        onChange={(e) => handleColumnFilterChange(column.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                      >
                        <option value="">All {column.label}</option>
                        {column.filterOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={`Filter ${column.label.toLowerCase()}...`}
                          value={columnFilters[column.key] || ""}
                          onChange={(e) => handleColumnFilterChange(column.key, e.target.value)}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        {columnFilters[column.key] && (
                          <button
                            onClick={() => handleColumnFilterChange(column.key, "")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                    column.sortable !== false && sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable !== false && sortable && (
                      <div className="flex flex-col">
                        {sortColumn === column.key ? (
                          sortDirection === 'asc' ? (
                            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )
                        ) : (
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-blue-50' : 'hover:bg-gray-50'}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : (
                      <span className="text-gray-900">{row[column.key]}</span>
                    )}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(row);
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(row);
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {paginatedData.length === 0 && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center space-y-3">
              <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="text-gray-500 text-lg font-medium">
                {(searchTerm || Object.values(columnFilters).some(v => v)) ? 'No matching records found' : 'No data available'}
              </div>
              {(searchTerm || Object.values(columnFilters).some(v => v)) && (
                <p className="text-gray-400 text-sm">
                  Try adjusting your search or filter criteria
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modern Pagination */}
      {pagination && totalPages > 1 && (
        <div className="bg-white border-t border-gray-200">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              {/* Results Summary */}
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold text-gray-900">
                    {Math.min(startIndex + currentPageSize, sortedData.length)}
                  </span>{' '}
                  of <span className="font-semibold text-gray-900">{sortedData.length}</span> results
                </span>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {(() => {
                    const pageNumbers = [];
                    const maxVisiblePages = 7;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    
                    if (endPage - startPage < maxVisiblePages - 1) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    // First page and ellipsis
                    if (startPage > 1) {
                      pageNumbers.push(
                        <button
                          key={1}
                          onClick={() => handlePageChange(1)}
                          className="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          1
                        </button>
                      );
                      if (startPage > 2) {
                        pageNumbers.push(
                          <span key="ellipsis1" className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500">
                            ...
                          </span>
                        );
                      }
                    }

                    // Main page numbers
                    for (let i = startPage; i <= endPage; i++) {
                      pageNumbers.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                            currentPage === i
                              ? 'z-10 bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }

                    // Last page and ellipsis
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pageNumbers.push(
                          <span key="ellipsis2" className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500">
                            ...
                          </span>
                        );
                      }
                      pageNumbers.push(
                        <button
                          key={totalPages}
                          onClick={() => handlePageChange(totalPages)}
                          className="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pageNumbers;
                  })()}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
