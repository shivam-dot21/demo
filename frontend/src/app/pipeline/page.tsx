import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import PipelineManagement from '@/features/pipeline/components/PipelineManagement';

export const metadata = {
    title: 'Pipeline - Prodify CRM',
};

export default function PipelinePage() {
    return (
        <ProtectedRoute>
            <MainLayout>
                <PipelineManagement />
            </MainLayout>
        </ProtectedRoute>
    );
}
