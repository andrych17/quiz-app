"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";

interface BaseIndexFormProps {
  title: string;
  subtitle?: string;
  createUrl?: string;
  createLabel?: string;
  onCreateClick?: () => void;
  children: ReactNode;
  showCreateButton?: boolean;
}

export function BaseIndexForm({
  title,
  subtitle,
  createUrl,
  createLabel = "Create New",
  onCreateClick,
  children,
  showCreateButton = true
}: BaseIndexFormProps) {
  const router = useRouter();

  const handleCreateClick = () => {
    if (onCreateClick) {
      onCreateClick();
    } else if (createUrl) {
      router.push(createUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4V7a2 2 0 00-2-2H7a2 2 0 00-2 2v4m14 0a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M7 7a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2H7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  {subtitle && (
                    <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                  )}
                </div>
              </div>
              {showCreateButton && (
                <button
                  onClick={handleCreateClick}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {createLabel}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
