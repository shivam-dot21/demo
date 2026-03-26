'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

export default function HomePage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
        const role = user.role;
        const dashboardMap: Record<string, string> = {
            'CEO': '/dashboard/ceo',
            'Sales': '/dashboard/sales',
            'Manager': '/dashboard/manager',
            'Support': '/dashboard/support',
            'admin': '/admin'
        };
        router.replace(dashboardMap[role] || '/dashboard');
    } else if (!loading && !isAuthenticated) {
        router.replace('/welcome');
    }
  }, [isAuthenticated, user, loading, router]);

  return (
    <div className="flex justify-center items-center h-screen font-sans">
      <div className="text-gray-500 animate-pulse font-bold text-xl tracking-tighter">
        Redirecting to your Dashboard...
      </div>
    </div>
  );
}
