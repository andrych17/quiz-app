"use client";

import { Sidebar } from "@/components/Sidebar";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  // Don't apply auth check for login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    const checkAuth = () => {
      const adminEmail = localStorage.getItem('adminEmail');
      if (!adminEmail) {
        router.replace('/admin/login');
        return;
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router, isLoginPage]);

  const handleLogout = () => {
    localStorage.removeItem('adminEmail');
    router.push('/admin/login');
  };

  // For login page, render without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
