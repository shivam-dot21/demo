import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import EmailTemplates from '@/features/email/components/EmailTemplates';

export const metadata = {
    title: 'Email Templates - Prodify CRM',
};

export default function EmailPage() {
    return (
        <ProtectedRoute>
            <MainLayout>
                <EmailTemplates />
            </MainLayout>
        </ProtectedRoute>
    );
}
