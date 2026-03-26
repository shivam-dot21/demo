'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace('/welcome');
        }

        if (!loading && isAuthenticated && allowedRoles && allowedRoles.length > 0) {
            const hasRequiredRole = user?.role === 'admin' || allowedRoles.includes(user?.role || '');

            if (!hasRequiredRole) {
                // Redirect based on their actual role if they try to access a forbidden page
                const dashboardMap: Record<string, string> = {
                    'CEO': '/dashboard/ceo',
                    'Sales': '/dashboard/sales',
                    'Manager': '/dashboard/manager',
                    'Support': '/dashboard/support',
                    'admin': '/admin'
                };
                router.replace(dashboardMap[user?.role || ''] || '/');
            }
        }
    }, [isAuthenticated, loading, user, allowedRoles, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-lg text-gray-500 font-sans">
                <div className="animate-pulse">Loading Prodify...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const hasRequiredRole = user?.role === 'admin' || allowedRoles.includes(user?.role || '');

        if (!hasRequiredRole) {
            return null;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
