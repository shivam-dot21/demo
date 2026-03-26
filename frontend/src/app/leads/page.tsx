import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import LeadsManagement from '@/features/leads/components/LeadsManagement';

export const metadata = {
    title: 'Leads - Prodify CRM',
};

export default function LeadsPage() {
    return (
        <ProtectedRoute>
            <MainLayout>
                <LeadsManagement />
            </MainLayout>
        </ProtectedRoute>
    );
}
