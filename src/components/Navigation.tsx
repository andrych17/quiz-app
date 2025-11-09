"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const pathname = usePathname();
  const { 
    user, 
    isAuthenticated, 
    isSuperadmin, 
    isAdmin, 
    canAccessAdminPanel,
    canManageUsers,
    canManageAssignments,
    logout 
  } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/admin/login";
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">📝</span>
              <span className="text-xl font-bold text-gray-900">Quiz App</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/" 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Home
            </Link>
            
            {canAccessAdminPanel && (
              <>
                <Link 
                  href="/admin/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === "/admin/dashboard" 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/quizzes" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname.startsWith("/admin/quizzes") 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {isSuperadmin ? 'All Quizzes' : 'My Quizzes'}
                </Link>
                
                {canManageUsers && (
                  <Link 
                    href="/admin/users" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname.startsWith("/admin/users") 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Users
                  </Link>
                )}
                
                {canManageAssignments && (
                  <Link 
                    href="/admin/assignments" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname.startsWith("/admin/assignments") 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Quiz Assignments
                  </Link>
                )}
                
                {isSuperadmin && (
                  <Link 
                    href="/admin/config" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname.startsWith("/admin/config") 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Configuration
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{user?.name}</span>
                  <span className="ml-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-col space-y-2">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/" ? "bg-blue-100 text-blue-700" : "text-gray-600"
              }`}
            >
              Home
            </Link>
            
            {canAccessAdminPanel && (
              <>
                <Link 
                  href="/admin/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === "/admin/dashboard" ? "bg-blue-100 text-blue-700" : "text-gray-600"
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/quizzes" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname.startsWith("/admin/quizzes") ? "bg-blue-100 text-blue-700" : "text-gray-600"
                  }`}
                >
                  {isSuperadmin ? 'All Quizzes' : 'My Quizzes'}
                </Link>
                
                {canManageUsers && (
                  <Link 
                    href="/admin/users" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname.startsWith("/admin/users") ? "bg-blue-100 text-blue-700" : "text-gray-600"
                    }`}
                  >
                    Users
                  </Link>
                )}
                
                {canManageAssignments && (
                  <Link 
                    href="/admin/assignments" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname.startsWith("/admin/assignments") ? "bg-blue-100 text-blue-700" : "text-gray-600"
                    }`}
                  >
                    Quiz Assignments
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
