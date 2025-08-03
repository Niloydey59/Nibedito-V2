'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/dashboard/UserProfile';
import VerificationStatus from '@/components/dashboard/VerificationStatus';
import SecuritySettings from '@/components/dashboard/SecuritySettings';
import OrderSummary from '@/components/dashboard/OrderSummary';
import { FiLogOut } from 'react-icons/fi';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading, logout } = useAuth();
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    useEffect(() => {
        if (!isLoading && user) {
            setIsDataLoaded(true);
        }
    }, [isLoading, user]);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [isLoading, user, router]);

    if (isLoading || !user || !isDataLoaded) {
        return <div className="loading-container">Loading...</div>;
    }

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="dash-container">
            <h1 className="dash-title">Dashboard</h1>
            <div className="dash-content">
                {/* First row: Profile and Orders */}
                <div className="dash-row">
                    {isDataLoaded && <UserProfile user={user} />}
                    <OrderSummary />
                </div>
                
                {/* Second row: Verification and Security */}
                <div className="dash-row">
                    {isDataLoaded && <VerificationStatus user={user} />}
                    <SecuritySettings />
                </div>
                
                <button onClick={handleLogout} className="dash-logout-btn">
                    <FiLogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}