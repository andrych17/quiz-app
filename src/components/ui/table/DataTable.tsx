"use client";

import { useState, useEffect } from "react";
import TableFilterBar, { FilterOption, TableFilters } from "./TableFilterBar";

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any, index: number) => React.ReactNode;
  className?: string;
}

export interface DataTableAction {
  label: string;
  onClick: (row: any) => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: (row: any) => boolean;
  show?: (row: any) => boolean;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  actions?: DataTableAction[];
  filters?: FilterOption[];
  defaultFilters?: TableFilters;
  onFilterChange?: (filters: TableFilters) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  topActions?: React.ReactNode;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
  showExport?: boolean;
  onExport?: () => void;
  className?: string;
}

export default function DataTable({
  data,
  columns,
  actions,
  filters = [],
  defaultFilters = {},
  onFilterChange,
  onSort,
  loading = false,
  emptyMessage = "Tidak ada data yang tersedia",
  emptyIcon,
  title,
  subtitle,
  topActions,
  pagination,
  showExport = false,
  onExport,
  className = ""
}: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterValues, setFilterValues] = useState<TableFilters>(defaultFilters);

  useEffect(() => {
    onFilterChange?.(filterValues);
  }, [filterValues, onFilterChange]);

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    const direction = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(columnKey);
    setSortDirection(direction);
    onSort?.(columnKey, direction);
  };

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
  };

  const handleClearFilters = () => {
    setFilterValues({});
  };

  const getActionButtonClass = (variant: string = 'secondary') => {
    const variants = {
      primary: 'text-blue-600 hover:text-blue-900 hover:bg-blue-50',
      secondary: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
      danger: 'text-red-600 hover:text-red-900 hover:bg-red-50',
      success: 'text-green-600 hover:text-green-900 hover:bg-green-50',
    };
    return variants[variant as keyof typeof variants] || variants.secondary;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {(title || subtitle || topActions) && (
        <div className="flex justify-between items-start">
          <div>
            {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
            {subtitle && <p className="mt-1 text-gray-600">{subtitle}</p>}
          </div>
          {topActions && <div className="flex space-x-3">{topActions}</div>}
        </div>
      )}

      {/* Filters */}
      {filters.length > 0 && (
        <TableFilterBar
          filters={filters}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        >
          {showExport && onExport && (
            <button
              onClick={onExport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          )}
        </TableFilterBar>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column.key)}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                    } ${column.className || ''}`}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <div className="flex flex-col">
                          <svg
                            className={`w-3 h-3 ${
                              sortColumn === column.key && sortDirection === 'asc'
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                          <svg
                            className={`w-3 h-3 -mt-1 ${
                              sortColumn === column.key && sortDirection === 'desc'
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-500">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      {emptyIcon || (
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      )}
                      <p className="text-gray-500 text-lg font-medium">{emptyMessage}</p>
                      <p className="text-gray-400 mt-1">Data akan muncul di sini setelah ditambahkan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row.id || index} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={column.key} className={`px-6 py-4 whitespace-nowrap text-sm ${column.className || ''}`}>
                        {column.render
                          ? column.render(row[column.key], row, index)
                          : row[column.key] || '-'
                        }
                      </td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end space-x-2">
                          {actions.map((action, actionIndex) => {
                            const shouldShow = action.show ? action.show(row) : true;
                            const isDisabled = action.disabled ? action.disabled(row) : false;
                            
                            if (!shouldShow) return null;

                            return (
                              <button
                                key={actionIndex}
                                onClick={() => !isDisabled && action.onClick(row)}
                                disabled={isDisabled}
                                className={`inline-flex items-center p-2 rounded-md text-sm font-medium transition-colors ${
                                  isDisabled
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : getActionButtonClass(action.variant)
                                }`}
                                title={action.label}
                              >
                                {action.icon}
                                <span className="sr-only">{action.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Menampilkan{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  sampai{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  dari{' '}
                  <span className="font-medium">{pagination.total}</span> data
                </span>

                <select
                  value={pagination.limit}
                  onChange={(e) => pagination.onLimitChange(Number(e.target.value))}
                  className="border border-gray-300 rounded-md text-sm px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10}>10 / halaman</option>
                  <option value={25}>25 / halaman</option>
                  <option value={50}>50 / halaman</option>
                  <option value={100}>100 / halaman</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.limit)) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => pagination.onPageChange(page)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        page === pagination.page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}