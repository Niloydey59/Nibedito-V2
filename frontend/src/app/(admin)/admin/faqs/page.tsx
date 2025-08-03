'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import dynamic from 'next/dynamic';

// Dynamically import the FaqManagement component to avoid SSR issues
const FaqManagement = dynamic(() => import('@/components/admin/faq/FaqManagement'), {
    ssr: false,
});

export default function FaqsAdminPage() {
    const router = useRouter();
    const { admin, isLoading } = useAdminAuth();
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    useEffect(() => {
        if (!isLoading && admin) {
            setIsDataLoaded(true);
        }
    }, [isLoading, admin]);

    useEffect(() => {
        if (!isLoading && !admin) {
            router.push('/admin-login');
        }
    }, [isLoading, admin, router]);

    if (isLoading || !admin || !isDataLoaded) {
        return <div className="admin-loading">Loading FAQ management...</div>;
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1>FAQs Management</h1>
                <div className="admin-profile">
                    <span className="admin-greeting">Welcome, {admin.name}</span>
                    <span className="admin-role">Super Admin</span>
                </div>
            </div>

            <div className="admin-content">
                <section className="admin-section">
                    <FaqManagement />
                </section>
            </div>
        </div>
    );
}
