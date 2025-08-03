'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { FiUsers, FiPackage, FiLogOut, FiGrid, FiTag, FiTruck, FiShoppingCart, FiMessageCircle, FiLayers } from 'react-icons/fi';

export default function AdminNavbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { admin, logoutAdmin } = useAdminAuth();
    
    const isPublicRoute = pathname === '/admin-login';

    const handleLogout = async () => {
        try {
            await logoutAdmin();
            router.push('/admin-login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className="admin-navbar">
            <div className="admin-navbar-container">
                <Link href={admin ? "/admin/dashboard" : "/"} className="admin-navbar-brand">
                    <Image
                        src="/images/logo-white.png"
                        alt="Nibedito Admin"
                        width={120}
                        height={40}
                        priority
                    />
                </Link>

                {!isPublicRoute && admin ? (
                    <>
                        <div className="admin-navbar-links">
                            <Link href="/admin/users" className="admin-nav-link">
                                <FiUsers /> Users
                            </Link>
                            <Link href="/admin/categories" className="admin-nav-link">
                                <FiGrid /> Categories
                            </Link>
                            <Link href="/admin/subcategories" className="admin-nav-link">
                                <FiLayers /> Subcategories
                            </Link>
                            <Link href="/admin/products" className="admin-nav-link">
                                <FiPackage /> Products
                            </Link>
                            <Link href="/admin/orders" className="admin-nav-link">
                                <FiShoppingCart /> Orders
                            </Link>
                            <Link href="/admin/coupons" className="admin-nav-link">
                                <FiTag /> Coupons
                            </Link>
                            <Link href="/admin/shipping" className="admin-nav-link">
                                <FiTruck /> Shipping
                            </Link>
                            <Link href="/admin/faqs" className="admin-nav-link">
                                <FiMessageCircle /> FAQs
                            </Link>
                        </div>

                        <div className="admin-navbar-profile">
                            <button onClick={handleLogout} className="admin-nav-logout">
                                <FiLogOut /> Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="admin-navbar-links">
                        <Link href="/" className="admin-nav-link">
                            Back to Store
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
