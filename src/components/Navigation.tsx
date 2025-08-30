"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // For demo purposes, we can assume user is not admin by default
    // or check current path to determine admin status
    setIsAdmin(pathname.startsWith('/admin') && pathname !== '/admin/login');
  }, [pathname]);

  const handleLogout = () => {
    // Simply redirect for demo
    setIsAdmin(false);
    window.location.href = "/";
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
            
            {isAdmin && (
              <>
                <Link 
                  href="/admin/quizzes" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname.startsWith("/admin/quizzes") 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  My Quizzes
                </Link>
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
              </>
            )}
          </div>

          {/* Auth Actions - Only show for admin users */}
          {isAdmin && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Admin Panel</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
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
            
            {isAdmin && (
              <>
                <Link 
                  href="/admin/quizzes" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname.startsWith("/admin/quizzes") ? "bg-blue-100 text-blue-700" : "text-gray-600"
                  }`}
                >
                  My Quizzes
                </Link>
                <Link 
                  href="/admin/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === "/admin/dashboard" ? "bg-blue-100 text-blue-700" : "text-gray-600"
                  }`}
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
