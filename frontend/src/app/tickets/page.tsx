import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import TicketsManagement from '@/features/tickets/components/TicketsManagement';

export const metadata = {
    title: 'Support Tickets - Prodify CRM',
};

export default function TicketsPage() {
    return (
        <ProtectedRoute>
            <MainLayout>
                <TicketsManagement />
            </MainLayout>
        </ProtectedRoute>
    );
}
