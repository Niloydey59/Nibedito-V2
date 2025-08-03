import React from 'react';
import Link from 'next/link';

const OrdersTable = ({ 
    orders, 
    loading, 
    onStatusUpdate,
    onPaidStatusUpdate, 
    onDelete, 
    onPageChange, 
    currentPage,
    totalPages
}) => {
    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const date = new Date(dateString);
        const datePart = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const timePart = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        return `${datePart}\n${timePart}`;
    };

    const formatPrice = (price) => {
        if (!price || isNaN(price)) return '৳0.00';
        return '৳' + price.toFixed(2);
    };

    if (loading) {
        return <div className="loading">Loading orders...</div>;
    }

    if (!orders || orders.length === 0) {
        return <div className="no-orders">No orders found</div>;
    }
    
    // Calculate total orders based on page size and total pages
    const totalOrders = (totalPages || 1) * 10; // Assuming 10 orders per page
    
    // Calculate range of orders being shown
    const startIndex = (currentPage - 1) * 10 + 1;
    const endIndex = Math.min(currentPage * 10, totalOrders);

    return (
        <div className="orders-table-container">
            <div className="orders-display-info">
                Showing <span className="highlight">{orders.length}</span> of <span className="highlight">{totalOrders}</span> orders
            </div>
            
            <div className="table-scroll-wrapper">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Price Details</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id} className="order-row">
                                <td>
                                    <Link href={`/admin/orders/${order._id}`} className="order-id-link">
                                        {order._id}
                                    </Link>
                                </td>
                                <td>{formatDate(order.createdAt)}</td>
                                <td>
                                    <div className="customer-info">
                                        <div className="customer-name">{order.user?.name || 'N/A'}</div>
                                        {(order.isGift || order.giftMessage || order.giftNote) && (
                                            <div className="gift-info">
                                                <div className="gift-badge">Gift Order</div>
                                                {(order.giftMessage || order.giftNote) && (
                                                    <div className="gift-note-container">
                                                        <span className="gift-note-label">Gift Note:</span>
                                                        <p className="gift-note-text">{order.giftMessage || order.giftNote}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="items-cell">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="item-info">
                                                <div className="item-name">
                                                    {item.productDetails?.name || 'Product ' + (index + 1)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <div className="price-details">
                                        <div>Subtotal: {formatPrice(order.totalPrice)}</div>
                                        {order.shippingCost > 0 && (
                                            <div>Shipping: {formatPrice(order.shippingCost)}</div>
                                        )}
                                        {(order.couponDetails || order.coupon || order.discountAmount > 0) && (
                                            <div className="discount-info">
                                                {(order.couponDetails?.code || order.coupon) && (
                                                    <div>Coupon: {order.couponDetails?.code || order.coupon}</div>
                                                )}
                                                {(order.discountAmount > 0 || order.couponDetails?.discount > 0) && (
                                                    <div>Discount: -{formatPrice(order.discountAmount || order.couponDetails?.discount || 0)}</div>
                                                )}
                                                {order.couponDetails?.productDiscount > 0 && (
                                                    <div>Product: -{formatPrice(order.couponDetails.productDiscount)}</div>
                                                )}
                                                {order.couponDetails?.shippingDiscount > 0 && (
                                                    <div>Shipping: -{formatPrice(order.couponDetails.shippingDiscount)}</div>
                                                )}
                                            </div>
                                        )}
                                        <div className="final-price">
                                            Final: {formatPrice(order.finalPrice || order.totalPrice)}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <select
                                        value={order.status}
                                        onChange={(e) => onStatusUpdate(order._id, e.target.value)}
                                        className={`status-select status-${order.status.toLowerCase()}`}
                                    >
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td>
                                    <div className="payment-status">
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={order.isPaid}
                                                onChange={(e) => onPaidStatusUpdate(order._id, e.target.checked)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                        <span className={`payment-text ${order.isPaid ? 'paid' : 'unpaid'}`}>
                                            {order.isPaid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="order-action-buttons">
                                        <Link 
                                            href={`/admin/orders/${order._id}`} 
                                            className="btn-primary"
                                            title="View Order Details"
                                        >
                                            View
                                        </Link>
                                        <button
                                            onClick={() => onDelete(order._id)}
                                            className="delete-btn"
                                            title="Delete Order"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="btn-pagination"
                >
                    Previous
                </button>
                
                <div className="pagination-pages">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => onPageChange(i + 1)}
                            className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                        >
                            {i + 1}
                        </button>
                    )).slice(
                        Math.max(0, currentPage - 3),
                        Math.min(totalPages, currentPage + 2)
                    )}
                </div>
                
                <span className="pagination-info">
                    Page {currentPage} of {totalPages || 1}
                </span>
                
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="btn-pagination"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default OrdersTable; 