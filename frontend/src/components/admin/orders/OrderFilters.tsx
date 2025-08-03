import React from 'react';

const OrderFilters = ({ filters, onFilterChange }) => {
    const orderStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

    return (
        <div className="admin-order-filters">
            <div className="admin-filter-group">
                <label htmlFor="status">Status:</label>
                <select
                    id="status"
                    value={filters.status}
                    onChange={(e) => onFilterChange({ status: e.target.value })}
                >
                    <option value="">All Statuses</option>
                    {orderStatuses.map(status => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            </div>

            <div className="admin-filter-group">
                <label htmlFor="userId">User ID:</label>
                <input
                    type="text"
                    id="userId"
                    value={filters.userId}
                    onChange={(e) => onFilterChange({ userId: e.target.value })}
                    placeholder="Filter by user ID"
                />
            </div>
            
            <div className="admin-filter-group">
                <label htmlFor="isGift">Gift Orders:</label>
                <select
                    id="isGift"
                    value={filters.isGift !== undefined ? filters.isGift.toString() : ''}
                    onChange={(e) => {
                        const value = e.target.value;
                        onFilterChange({ 
                            isGift: value === '' ? undefined : value === 'true' 
                        });
                    }}
                >
                    <option value="">All Orders</option>
                    <option value="true">Gift Orders Only</option>
                    <option value="false">Regular Orders (Non-Gift)</option>
                </select>
            </div>

            <div className="admin-filter-group">
                <label htmlFor="sortBy">Sort By:</label>
                <select
                    id="sortBy"
                    value={filters.sortBy}
                    onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                >
                    <option value="createdAt">Date Created</option>
                    <option value="totalPrice">Total Price</option>
                    <option value="status">Status</option>
                </select>
            </div>

            <div className="admin-filter-group">
                <label htmlFor="order">Order:</label>
                <select
                    id="order"
                    value={filters.order}
                    onChange={(e) => onFilterChange({ order: e.target.value })}
                >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                </select>
            </div>
        </div>
    );
};

export default OrderFilters; 