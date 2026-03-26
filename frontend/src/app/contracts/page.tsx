import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import ContractManagement from '@/features/contracts/components/ContractManagement';

export const metadata = {
    title: 'Contracts - Prodify CRM',
};

export default function ContractsPage() {
    return (
        <ProtectedRoute>
            <MainLayout>
                <ContractManagement />
            </MainLayout>
        </ProtectedRoute>
    );
}
