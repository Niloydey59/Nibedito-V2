'use client';

import { useState, useEffect } from 'react';
import { orderService } from '@/services/orderService';
import Link from 'next/link';
import { FiShoppingBag, FiArrowRight } from 'react-icons/fi';

const OrderSummary = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        processing: 0,
        delivered: 0,
        cancelled: 0
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const result = await orderService.getUserOrders();
            if (result.success) {
                const recentOrders = result.data.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                ).slice(0, 3); // Get only the 3 most recent orders
                
                setOrders(recentOrders);
                
                // Calculate order statistics
                const allOrders = result.data;
                const processingOrders = allOrders.filter(order => 
                    (order.status || '').toLowerCase() === 'processing'
                );
                const deliveredOrders = allOrders.filter(order => 
                    (order.status || '').toLowerCase() === 'delivered'
                );
                const cancelledOrders = allOrders.filter(order => 
                    (order.status || '').toLowerCase() === 'cancelled'
                );
                
                setStats({
                    total: allOrders.length,
                    processing: processingOrders.length,
                    delivered: deliveredOrders.length,
                    cancelled: cancelledOrders.length
                });
            }
        } catch (error) {
            console.error('Fetch orders error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (typeof price !== 'number') return '0.00';
        return price.toFixed(2);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="dashboard-card order-summary-card">
                <h2>My Orders</h2>
                <div className="loading-indicator">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-card order-summary-card">
            <div className="card-header">
                <h2>My Orders</h2>
                <Link href="/my-orders" className="view-all-link">
                    View All <FiArrowRight />
                </Link>
            </div>
            
            <div className="order-stats">
                <div className="stat-item">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total Orders</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{stats.processing}</span>
                    <span className="stat-label">Processing</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{stats.delivered}</span>
                    <span className="stat-label">Delivered</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{stats.cancelled}</span>
                    <span className="stat-label">Cancelled</span>
                </div>
            </div>
            
            <h3 className="recent-orders-title">Recent Orders</h3>
            
            {orders.length === 0 ? (
                <div className="no-orders-message">
                    <FiShoppingBag size={24} />
                    <p>You haven't placed any orders yet.</p>
                    <Link href="/products">
                        <button className="shop-now-btn">Shop Now</button>
                    </Link>
                </div>
            ) : (
                <div className="recent-orders-list">
                    {orders.map(order => (
                        <div key={order._id} className="recent-order-item">
                            <div className="order-item-header">
                                <div className="order-id">#{order._id.substring(order._id.length - 8)}</div>
                                <div className={`order-status ${order.status?.toLowerCase() || 'processing'}`}>
                                    {order.status || 'Processing'}
                                </div>
                            </div>
                            <div className="order-item-details">
                                <div className="order-date">
                                    Placed on: {formatDate(order.createdAt)}
                                </div>
                                <div className="order-amount">
                                    ৳{formatPrice(order.finalPrice)}
                                </div>
                            </div>
                            <div className="order-items-count">
                                {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                            </div>
                            <Link href={`/my-orders`} className="view-order-link">
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderSummary; 