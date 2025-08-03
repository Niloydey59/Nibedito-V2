'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { orderService } from '@/services/orderService';
import Link from 'next/link';

export default function MyOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();
    
    // Filter states
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [giftFilter, setGiftFilter] = useState('all'); // Add gift filter
    const [sortByDate, setSortByDate] = useState('latest'); // latest or oldest
    const [sortByPrice, setSortByPrice] = useState('none'); // highest, lowest, or none
    const [isFilterVisible, setIsFilterVisible] = useState(true); // Default to visible on desktop
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(10); // Fixed value, removed setter
    const [paginatedOrders, setPaginatedOrders] = useState([]);
    
    // Get unique statuses from orders
    const getUniqueStatuses = () => {
        const statuses = orders.map(order => order.status || 'Processing');
        return ['all', ...new Set(statuses)];
    };

    useEffect(() => {
        if (!user) {
            router.push('/login?redirect=/my-orders');
            return;
        }
        fetchOrders();
    }, [user]);
    
    // Apply filters whenever filter states change
    useEffect(() => {
        applyFilters();
    }, [statusFilter, paymentFilter, giftFilter, sortByDate, sortByPrice, orders]);
    
    // Apply pagination whenever filtered orders or pagination settings change
    useEffect(() => {
        applyPagination();
    }, [filteredOrders, currentPage, ordersPerPage]);

    const fetchOrders = async () => {
        try {
            const result = await orderService.getUserOrders();
            if (result.success) {
                console.log('Orders:', result.data); // Debug log
                // Add additional debug logging for gift orders
                const giftOrders = result.data.filter(order => order.isGift === true);
                console.log('Gift orders:', giftOrders);
                console.log('Number of gift orders:', giftOrders.length);
                
                const sortedOrders = result.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sortedOrders);
                setFilteredOrders(sortedOrders);
            } else {
                toast.error(result.error || 'Failed to fetch orders');
            }
        } catch (error) {
            toast.error('Error fetching orders');
            console.error('Fetch orders error:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const applyFilters = () => {
        let result = [...orders];
        
        // Apply status filter
        if (statusFilter !== 'all') {
            result = result.filter(order => 
                (order.status || 'Processing').toLowerCase() === statusFilter.toLowerCase()
            );
        }
        
        // Apply payment filter
        if (paymentFilter !== 'all') {
            const isPaid = paymentFilter === 'paid';
            result = result.filter(order => order.isPaid === isPaid);
        }
        
        // Apply gift filter
        if (giftFilter !== 'all') {
            if (giftFilter === 'gift') {
                // Explicitly check for true (not truthy)
                result = result.filter(order => order.isGift === true);
                console.log('After gift filter:', result);
            } else {
                // Explicitly check for false or undefined/null
                result = result.filter(order => order.isGift === false || order.isGift === undefined || order.isGift === null);
                console.log('After personal filter:', result);
            }
        }
        
        // Apply date sorting
        if (sortByDate === 'latest') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortByDate === 'oldest') {
            result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
        
        // Apply price sorting
        if (sortByPrice === 'highest') {
            result.sort((a, b) => (b.finalPrice || 0) - (a.finalPrice || 0));
        } else if (sortByPrice === 'lowest') {
            result.sort((a, b) => (a.finalPrice || 0) - (b.finalPrice || 0));
        }
        
        setFilteredOrders(result);
    };
    
    const applyPagination = () => {
        const indexOfLastOrder = currentPage * ordersPerPage;
        const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
        setPaginatedOrders(filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder));
    };
    
    const resetFilters = () => {
        setStatusFilter('all');
        setPaymentFilter('all');
        setGiftFilter('all');
        setSortByDate('latest');
        setSortByPrice('none');
        setCurrentPage(1); // Reset to first page when filters are reset
    };
    
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    
    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5; // Show at most 5 page numbers
        
        if (totalPages <= maxVisiblePages) {
            // If there are 5 or fewer pages, show all
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always include first page
            pages.push(1);
            
            // Calculate start and end page numbers to show
            let startPage, endPage;
            if (currentPage <= 3) {
                startPage = 2;
                endPage = 4;
            } else if (currentPage >= totalPages - 2) {
                startPage = totalPages - 3;
                endPage = totalPages - 1;
            } else {
                startPage = currentPage - 1;
                endPage = currentPage + 1;
            }
            
            // Add ellipsis after first page if needed
            if (startPage > 2) {
                pages.push('...');
            }
            
            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            
            // Add ellipsis before last page if needed
            if (endPage < totalPages - 1) {
                pages.push('...');
            }
            
            // Always include last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price) => {
        if (typeof price !== 'number') return '0.00';
        return price.toFixed(2);
    };

    const formatPhoneNumber = (phone) => {
        if (!phone) return '';
        // Remove any non-digit characters and trim leading zeros
        const cleaned = phone.replace(/\D/g, '').replace(/^0+/, '');
        // Add +880 if it's a 10-digit number
        return cleaned.length === 10 ? `+880${cleaned}` : `+880${cleaned}`;
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!orders.length) {
        return (
            <div className="no-orders">
                <h2>No Orders Found</h2>
                <p>You haven't placed any orders yet.</p>
                <Link href="/products">
                    <button>Start Shopping</button>
                </Link>
            </div>
        );
    }

    return (
        <div className="page-title-container">
            <h1>My Orders</h1>
            
            <div className="orders-layout">
                {/* Filter Sidebar */}
                <div className="filter-sidebar">
                    <div className="filter-header">
                        <h3>Filter Orders</h3>
                        <button 
                            className="toggle-filters-button mobile-only"
                            onClick={() => setIsFilterVisible(!isFilterVisible)}
                        >
                            {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>
                    
                    <div className={`filter-container ${isFilterVisible ? 'visible' : 'hidden'}`}>
                        <div className="filter-section">
                            <h4>Order Status</h4>
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                {getUniqueStatuses().map(status => (
                                    <option key={status} value={status.toLowerCase()}>
                                        {status === 'all' ? 'All Statuses' : status}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="filter-section">
                            <h4>Payment Status</h4>
                            <select 
                                value={paymentFilter} 
                                onChange={(e) => setPaymentFilter(e.target.value)}
                            >
                                <option value="all">All Payments</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>
                        
                        <div className="filter-section gift-filter-section">
                            <h4>🎁 Order Type</h4>
                            <select 
                                value={giftFilter} 
                                onChange={(e) => setGiftFilter(e.target.value)}
                                className="gift-filter-select"
                            >
                                <option value="all">All Orders</option>
                                <option value="gift">Gift Orders</option>
                                <option value="personal">Personal Orders</option>
                            </select>
                        </div>
                        
                        <div className="filter-section">
                            <h4>Sort by Date</h4>
                            <select
                                value={sortByDate}
                                onChange={(e) => setSortByDate(e.target.value)}
                            >
                                <option value="latest">Latest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>
                        
                        <div className="filter-section">
                            <h4>Sort by Price</h4>
                            <select
                                value={sortByPrice}
                                onChange={(e) => setSortByPrice(e.target.value)}
                            >
                                <option value="none">No Price Sorting</option>
                                <option value="highest">Highest Price First</option>
                                <option value="lowest">Lowest Price First</option>
                            </select>
                        </div>
                        
                        <div className="filter-actions">
                            <button 
                                className="reset-filters-button"
                                onClick={resetFilters}
                            >
                                Reset Filters
                            </button>
                        </div>
                        
                        <div className="filter-summary">
                            <div className="total-orders">
                                Showing {paginatedOrders.length} of {filteredOrders.length} Orders
                                {filteredOrders.length > ordersPerPage && 
                                    ` (Page ${currentPage} of ${totalPages})`}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Orders Content Area */}
                <div className="orders-content">
                    {filteredOrders.length === 0 ? (
                        <div className="no-filtered-orders">
                            <h3>No orders match your filters</h3>
                            <button 
                                onClick={resetFilters}
                                className="reset-filters-button"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="orders-list">
                                {paginatedOrders.map((order) => (
                                    <div key={order._id} className="order-card">
                                        <div className="order-header">
                                            <div className="order-info">
                                                <h3>Order #{order._id}</h3>
                                                <p>Placed on: {formatDate(order.dateOrdered || order.createdAt)}</p>
                                                <p className="order-type">
                                                    {order.isGift === true ? (
                                                        <span className="for-gift">🎁 Gift Order</span>
                                                    ) : (
                                                        <span className="for-self">👤 Personal Order</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="order-status">
                                                <span className={`status ${order.status?.toLowerCase() || 'processing'}`}>
                                                    {order.status || 'Processing'}
                                                </span>
                                                {order.isPaid ? (
                                                    <span className="paid">Paid</span>
                                                ) : (
                                                    <span className="unpaid">Unpaid</span>
                                                )}
                                                
                                                {order.isGift === true && (
                                                    <span className="gift-badge">Gift</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="order-items">
                                            {order.items?.map((item) => (
                                                <div key={item._id} className="item">
                                                    <div className="item-details">
                                                        <div className="item-image">
                                                            {item.product?.thumbnailImage ? (
                                                                <img 
                                                                    src={item.product.thumbnailImage} 
                                                                    alt={item.product?.name || 'Product'} 
                                                                    className="product-thumbnail"
                                                                />
                                                            ) : (
                                                                <div className="product-thumbnail placeholder">
                                                                    <span>{item.product?.name?.charAt(0) || 'P'}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="item-info">
                                                            <span className="item-name">
                                                                {item.product?.name || 'Product'}
                                                            </span>
                                                            <div className="item-meta">
                                                                <span className="item-quantity">
                                                                    Quantity: {item.quantity || 0}
                                                                </span>
                                                                <span className="item-price">
                                                                    Price per item: ৳{formatPrice(item.cost / (item.quantity || 1))}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className="item-cost">
                                                            ৳{formatPrice(item.cost)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="order-footer">
                                            <div className="shipping-info">
                                                <h4>Shipping Information</h4>
                                                <p>
                                                    <strong>Address:</strong> {order.street}, {order.city}, {order.state}
                                                </p>
                                                {order.addressDetails && (
                                                    <p>
                                                        <strong>Additional Details:</strong> {order.addressDetails}
                                                    </p>
                                                )}
                                                <p>
                                                    <strong>Phone:</strong> {formatPhoneNumber(order.phone)}
                                                </p>
                                                <p>
                                                    <strong>Email:</strong> {order.email}
                                                </p>
                                                {order.isGift === true && (
                                                    <div className="gift-information">
                                                        <h4>Gift Information</h4>
                                                        {order.giftNote ? (
                                                            <div className="gift-note">
                                                                <strong>Gift Note:</strong>
                                                                <div className="note-content">{order.giftNote}</div>
                                                            </div>
                                                        ) : (
                                                            <p>This order will be prepared as a gift.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="order-summary">
                                                <div className="price-breakdown">
                                                    <p>
                                                        <span>Subtotal:</span>
                                                        <span>৳{formatPrice(order.totalPrice)}</span>
                                                    </p>
                                                    <p>
                                                        <span>Shipping:</span>
                                                        <span>৳{formatPrice(order.shippingCost)}</span>
                                                    </p>
                                                    {order.discountAmount > 0 && (
                                                        <>
                                                            <p>
                                                                <span>Product Discount:</span>
                                                                <span>-৳{formatPrice(order.discountBreakdown?.productDiscount || 0)}</span>
                                                            </p>
                                                            <p>
                                                                <span>Shipping Discount:</span>
                                                                <span>-৳{formatPrice(order.discountBreakdown?.shippingDiscount || 0)}</span>
                                                            </p>
                                                            <p className="total-discount">
                                                                <span>Total Discount:</span>
                                                                <span>-৳{formatPrice(order.discountAmount)}</span>
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="total-price">
                                                    <strong>৳{formatPrice(order.finalPrice)}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="pagination-controls">
                                    <button 
                                        className="pagination-arrow" 
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        &laquo; Prev
                                    </button>
                                    
                                    <div className="pagination-numbers">
                                        {getPageNumbers().map((page, index) => (
                                            page === '...' ? (
                                                <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                                            ) : (
                                                <button 
                                                    key={page} 
                                                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        ))}
                                    </div>
                                    
                                    <button 
                                        className="pagination-arrow" 
                                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next &raquo;
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} 