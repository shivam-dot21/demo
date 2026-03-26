import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import InvoicesManagement from '@/features/invoices/components/InvoicesManagement';

export const metadata = {
    title: 'Invoices - Prodify CRM',
};

export default function InvoicesPage() {
    return (
        <ProtectedRoute>
            <MainLayout>
                <InvoicesManagement />
            </MainLayout>
        </ProtectedRoute>
    );
}
