'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminService } from '@/services/adminService';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const response = await adminService.getOrderById(orderId);
                setOrder(response.payload);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to fetch order details');
                toast.error(err.message || 'Failed to fetch order details');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleString('en-US', options);
    };

    const formatPrice = (price) => {
        if (!price || isNaN(price)) return '৳0.00';
        return '৳' + price.toFixed(2);
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            await adminService.updateOrderStatus(orderId, newStatus);
            toast.success('Order status updated successfully');
            
            // Update local state to reflect change
            setOrder(prev => ({
                ...prev,
                status: newStatus
            }));
        } catch (err) {
            toast.error(err.message || 'Failed to update order status');
        }
    };

    const handlePaidStatusUpdate = async (isPaid) => {
        try {
            await adminService.updateOrderPaidStatus(orderId, isPaid);
            toast.success(`Order marked as ${isPaid ? 'paid' : 'unpaid'}`);
            
            // Update local state to reflect change
            setOrder(prev => ({
                ...prev,
                isPaid: isPaid
            }));
        } catch (err) {
            toast.error(err.message || 'Failed to update payment status');
        }
    };

    const handleOrderDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this order?')) {
            return;
        }

        try {
            await adminService.deleteOrder(orderId);
            toast.success('Order deleted successfully');
            router.push('/admin/orders');
        } catch (err) {
            toast.error(err.message || 'Failed to delete order');
        }
    };

    if (loading) {
        return <div className="order-details-loading">Loading order details...</div>;
    }

    if (error) {
        return (
            <div className="order-details-error">
                <h2>Error loading order</h2>
                <p>{error}</p>
                <Link href="/admin/orders" className="back-button">Back to All Orders</Link>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-not-found">
                <h2>Order Not Found</h2>
                <p>The order you are looking for does not exist or has been deleted.</p>
                <Link href="/admin/orders" className="back-button">Back to All Orders</Link>
            </div>
        );
    }

    return (
        <div className="order-details-container">
            <div className="order-details-header">
                <Link href="/admin/orders" className="back-button">
                    &larr; Back to All Orders
                </Link>
                <h1>Order Details</h1>
                <div className="order-id">
                    Order ID: <span>{order._id}</span>
                </div>
                <div className="order-date">
                    Ordered on: <span>{formatDate(order.createdAt)}</span>
                </div>
            </div>

            <div className="order-details-grid">
                <div className="order-details-section customer-section">
                    <h2>Customer Details</h2>
                    <div className="customer-details">
                        <div className="customer-name">{order.user?.name || 'Guest'}</div>
                        {order.user?._id && (
                            <Link href={`/admin/users/${order.user._id}`} className="customer-link">
                                View Customer Profile
                            </Link>
                        )}
                        <div className="customer-contact">
                            <div><strong>Email:</strong> {order.email || order.user?.email || 'N/A'}</div>
                            <div><strong>Phone:</strong> {order.phone || order.user?.phone || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div className="order-details-section shipping-section">
                    <h2>Shipping Information</h2>
                    <div className="shipping-details">
                        <div><strong>Address:</strong> {order.street}</div>
                        <div><strong>City:</strong> {order.city}</div>
                        <div><strong>State:</strong> {order.state}</div>
                        {order.addressDetails && (
                            <div><strong>Additional Details:</strong> {order.addressDetails}</div>
                        )}
                        {order.shippingRegion && (
                            <div><strong>Shipping Region:</strong> {order.shippingRegion}</div>
                        )}
                        {order.freeShipping !== undefined && (
                            <div><strong>Free Shipping:</strong> {order.freeShipping ? 'Yes' : 'No'}</div>
                        )}
                    </div>
                </div>
            </div>

            {(order.isGift || order.giftMessage || order.giftNote) && (
                <div className="order-details-section gift-section">
                    <h2>Gift Information</h2>
                    <div className="gift-details">
                        <div className="gift-badge">Gift Order</div>
                        {(order.giftMessage || order.giftNote) && (
                            <div className="gift-note">
                                <strong>Gift Note:</strong>
                                <div className="gift-note-text">{order.giftMessage || order.giftNote}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="order-details-section">
                <h2>Order Items</h2>
                <table className="order-items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Variant</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, index) => (
                            <tr key={index}>
                                <td className="product-cell">
                                    {item.productDetails?.name || 'Unknown Product'}
                                    {item.product && typeof item.product === 'string' && (
                                        <div className="product-slug">
                                            {item.productDetails?.slug 
                                                ? `Slug: ${item.productDetails.slug}` 
                                                : `Product ID: ${item.product}`}
                                        </div>
                                    )}
                                    {item.product && (
                                        <Link 
                                            href={`/admin/products/${item.productDetails?.slug || item.product}`}
                                            className="view-product-link"
                                        >
                                            View Product
                                        </Link>
                                    )}
                                </td>
                                <td>
                                    {item.variantDetails?.color && <div>Color: {item.variantDetails.color}</div>}
                                    {item.variantDetails?.size && <div>Size: {item.variantDetails.size}</div>}
                                    {!item.variantDetails && item.variant && <div>Variant ID: {item.variant}</div>}
                                </td>
                                <td>{item.quantity}</td>
                                <td>{formatPrice(item.productDetails?.price || item.price || (item.cost / item.quantity))}</td>
                                <td>{formatPrice(item.cost || (item.productDetails?.price * item.quantity))}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="order-details-grid">
                <div className="order-details-section price-section">
                    <h2>Price Details</h2>
                    <div className="price-breakdown">
                        <div className="price-row">
                            <span>Subtotal:</span>
                            <span>{formatPrice(order.totalPrice)}</span>
                        </div>
                        <div className="price-row">
                            <span>Shipping:</span>
                            <span>{formatPrice(order.shippingCost || 0)}</span>
                        </div>
                        
                        {(order.couponDetails || order.coupon || order.discountAmount > 0) && (
                            <div className="coupon-discount-section">
                                <div className="price-row coupon-row">
                                    <span>Coupon Applied:</span>
                                    <span>
                                        {order.couponDetails?.code || 
                                         (order.coupon && typeof order.coupon === 'object' ? order.coupon.code : 
                                          (typeof order.coupon === 'string' ? order.coupon : 'Applied'))}
                                    </span>
                                </div>
                                
                                {(order.couponDetails?.description || (order.coupon && typeof order.coupon === 'object' && order.coupon.description)) && (
                                    <div className="price-row coupon-description">
                                        <span>Description:</span>
                                        <span>{order.couponDetails?.description || order.coupon.description}</span>
                                    </div>
                                )}

                                {order.coupon && typeof order.coupon === 'object' && order.coupon.discountOptions && (
                                    <div className="coupon-discount-type">
                                        <span>Coupon Discount Details</span>
                                        <span>
                                            {order.coupon.discountOptions.productDiscount && (
                                                <div className="discount-type-detail">
                                                    <strong>Product Discount:</strong> {order.coupon.discountOptions.productDiscount.type} 
                                                    ({order.coupon.discountOptions.productDiscount.type === 'percentage' 
                                                        ? `${order.coupon.discountOptions.productDiscount.value}%` 
                                                        : formatPrice(order.coupon.discountOptions.productDiscount.value)})
                                                    {order.coupon.discountOptions.productDiscount.maxDiscount && 
                                                        ` (Max: ${formatPrice(order.coupon.discountOptions.productDiscount.maxDiscount)})`}
                                                </div>
                                            )}
                                            {order.coupon.discountOptions.shippingDiscount && order.coupon.discountOptions.shippingDiscount.type !== 'none' && (
                                                <div className="discount-type-detail">
                                                    <strong>Shipping Discount:</strong> {order.coupon.discountOptions.shippingDiscount.type}
                                                    {order.coupon.discountOptions.shippingDiscount.type !== 'free' && 
                                                    ` (${order.coupon.discountOptions.shippingDiscount.type === 'percentage' 
                                                        ? `${order.coupon.discountOptions.shippingDiscount.value}%` 
                                                        : formatPrice(order.coupon.discountOptions.shippingDiscount.value)})`}
                                                </div>
                                            )}
                                            {order.coupon.minOrderAmount > 0 && (
                                                <div className="discount-type-detail">
                                                    <strong>Min Order Amount:</strong> {formatPrice(order.coupon.minOrderAmount)}
                                                </div>
                                            )}
                                            {order.coupon.usageLimit > 0 && (
                                                <div className="discount-type-detail">
                                                    <strong>Usage Limit:</strong> {order.coupon.usageLimit} per customer
                                                </div>
                                            )}
                                        </span>
                                    </div>
                                )}

                                <div className="applied-discount-section">
                                    {(order.discountAmount > 0) && (
                                        <div className="price-row discount-row">
                                            <span>Total Discount Applied:</span>
                                            <span>-{formatPrice(order.discountAmount)}</span>
                                        </div>
                                    )}
                                    {order.discountBreakdown?.productDiscount > 0 && (
                                        <div className="price-row discount-row discount-detail">
                                            <span>Product Discount:</span>
                                            <span>-{formatPrice(order.discountBreakdown.productDiscount)}</span>
                                        </div>
                                    )}
                                    {order.discountBreakdown?.shippingDiscount > 0 && (
                                        <div className="price-row discount-row discount-detail">
                                            <span>Shipping Discount:</span>
                                            <span>-{formatPrice(order.discountBreakdown.shippingDiscount)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <div className="price-row total-row">
                            <span>Total:</span>
                            <span>{formatPrice(order.finalPrice || order.totalPrice)}</span>
                        </div>
                    </div>
                </div>

                <div className="order-details-section status-section">
                    <h2>Order Status</h2>
                    <div className="status-controls">
                        <div className="status-control">
                            <label>Order Status:</label>
                            <select
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(e.target.value)}
                                className={`status-select status-${order.status.toLowerCase()}`}
                            >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        
                        <div className="status-control payment-status">
                            <label>Payment Status:</label>
                            <div className="payment-toggle">
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={order.isPaid}
                                        onChange={(e) => handlePaidStatusUpdate(e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                                <span className={`payment-text ${order.isPaid ? 'paid' : 'unpaid'}`}>
                                    {order.isPaid ? 'Paid' : 'Unpaid'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="order-details-section actions-section">
                <h2>Order Actions</h2>
                <div className="action-buttons">
                    <button 
                        onClick={handleOrderDelete} 
                        className="delete-order-btn"
                    >
                        Delete Order
                    </button>
                </div>
            </div>
        </div>
    );
} 