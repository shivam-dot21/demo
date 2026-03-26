import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import Segments from '@/features/customers/components/Segments';

export const metadata = {
    title: 'Segments - Prodify CRM',
};

export default function SegmentsPage() {
    return (
        <ProtectedRoute>
            <MainLayout>
                <Segments />
            </MainLayout>
        </ProtectedRoute>
    );
}
