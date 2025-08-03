'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import OrdersTable from '@/components/admin/orders/OrdersTable';
import OrderFilters from '@/components/admin/orders/OrderFilters';
import { toast } from 'react-hot-toast';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1
    });
    const [giftOrdersCount, setGiftOrdersCount] = useState(0);
    const [filters, setFilters] = useState({
        status: '',
        userId: '',
        isGift: undefined,
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc'
    });

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllOrders(filters);
            setOrders(response.payload.orders);
            setPagination(response.payload.pagination);
            setError(null);
            
            // Count gift orders if viewing all orders
            if (filters.isGift === undefined) {
                const giftOrders = response.payload.orders.filter(order => order.isGift === true);
                setGiftOrdersCount(giftOrders.length);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch orders');
            toast.error(err.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await adminService.updateOrderStatus(orderId, newStatus);
            toast.success('Order status updated successfully');
            fetchOrders();
        } catch (err) {
            toast.error(err.message || 'Failed to update order status');
        }
    };

    const handlePaidStatusUpdate = async (orderId, isPaid) => {
        try {
            await adminService.updateOrderPaidStatus(orderId, isPaid);
            toast.success(`Order marked as ${isPaid ? 'paid' : 'unpaid'}`);
            fetchOrders();
        } catch (err) {
            toast.error(err.message || 'Failed to update payment status');
        }
    };

    const handleOrderDelete = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this order?')) {
            return;
        }

        try {
            await adminService.deleteOrder(orderId);
            toast.success('Order deleted successfully');
            fetchOrders();
        } catch (err) {
            toast.error(err.message || 'Failed to delete order');
        }
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="admin-orders-container">
            <div className="admin-header">
                <h1>Order Management</h1>
                <div className="order-stats">
                    <div className="orders-stat-item">
                        <span className="stat-label">Total Orders</span>
                        <span className="stat-value">{pagination.total}</span>
                    </div>
                    <div className="orders-stat-item">
                        <span className="stat-label">Gift Orders</span>
                        <span className="stat-value gift-value">{filters.isGift === true ? pagination.total : giftOrdersCount}</span>
                    </div>
                </div>
            </div>
            
            <OrderFilters 
                filters={filters} 
                onFilterChange={handleFilterChange} 
            />
            
            {filters.isGift !== undefined && (
                <div className="filter-info">
                    <p>
                        {filters.isGift === true 
                            ? "Showing only orders marked as gifts." 
                            : "Showing only regular orders."}
                    </p>
                </div>
            )}

            <OrdersTable 
                orders={orders}
                loading={loading}
                onStatusUpdate={handleStatusUpdate}
                onPaidStatusUpdate={handlePaidStatusUpdate}
                onDelete={handleOrderDelete}
                onPageChange={handlePageChange}
                currentPage={pagination.page}
                totalPages={pagination.pages}
            />
        </div>
    );
} 