import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import Reports from '@/features/reports/components/Reports';

export const metadata = {
    title: 'Reports - Prodify CRM',
};

export default function ReportsPage() {
    return (
        <ProtectedRoute>
            <MainLayout>
                <Reports />
            </MainLayout>
        </ProtectedRoute>
    );
}
