'use client';

import { useState, useEffect } from 'react';
import { getAllCoupons, deleteCoupon, createCoupon, updateCoupon, getCouponById } from '@/services/couponService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingCouponId, setEditingCouponId] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        productDiscountType: 'none',
        productDiscountValue: 0,
        shippingDiscountType: 'none',
        shippingDiscountValue: 0,
        expiryDate: '',
        minOrderAmount: 0,
        maxDiscount: 0,
        usageLimit: 1,
    });

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        try {
            const response = await getAllCoupons();
            setCoupons(response.payload);
            setLoading(false);
        } catch (error) {
            toast.error(error.message || 'Failed to load coupons');
            setLoading(false);
        }
    };

    const handleDelete = async (couponId) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                await deleteCoupon(couponId);
                toast.success('Coupon deleted successfully');
                loadCoupons();
            } catch (error) {
                toast.error(error.message || 'Failed to delete coupon');
            }
        }
    };

    const handleEdit = async (couponId) => {
        try {
            setLoading(true);
            const response = await getCouponById(couponId);
            const coupon = response.payload;
            
            // Format date string to be compatible with datetime-local input
            const expiryDate = new Date(coupon.expiryDate);
            const formattedDate = expiryDate.toISOString().slice(0, 16);
            
            setFormData({
                code: coupon.code,
                productDiscountType: coupon.discountOptions.productDiscount.type,
                productDiscountValue: coupon.discountOptions.productDiscount.value,
                shippingDiscountType: coupon.discountOptions.shippingDiscount.type,
                shippingDiscountValue: coupon.discountOptions.shippingDiscount.value,
                expiryDate: formattedDate,
                minOrderAmount: coupon.minOrderAmount,
                maxDiscount: coupon.discountOptions.productDiscount.maxDiscount || 0,
                usageLimit: coupon.usageLimit,
            });
            
            setEditMode(true);
            setEditingCouponId(couponId);
            setShowAddForm(true);
            setLoading(false);
        } catch (error) {
            toast.error(error.message || 'Failed to load coupon details');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await updateCoupon(editingCouponId, formData);
                toast.success('Coupon updated successfully');
            } else {
                await createCoupon(formData);
                toast.success('Coupon created successfully');
            }
            
            setShowAddForm(false);
            setEditMode(false);
            setEditingCouponId(null);
            setFormData({
                code: '',
                productDiscountType: 'none',
                productDiscountValue: 0,
                shippingDiscountType: 'none',
                shippingDiscountValue: 0,
                expiryDate: '',
                minOrderAmount: 0,
                maxDiscount: 0,
                usageLimit: 1,
            });
            loadCoupons();
        } catch (error) {
            toast.error(error.message || 'Failed to save coupon');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const cancelEdit = () => {
        setEditMode(false);
        setEditingCouponId(null);
        setShowAddForm(false);
        setFormData({
            code: '',
            productDiscountType: 'none',
            productDiscountValue: 0,
            shippingDiscountType: 'none',
            shippingDiscountValue: 0,
            expiryDate: '',
            minOrderAmount: 0,
            maxDiscount: 0,
            usageLimit: 1,
        });
    };

    if (loading) {
        return <div className="admin-coupons">Loading...</div>;
    }

    return (
        <div className="admin-coupons">
            <div className="admin-coupons-header">
                <h1 className="admin-coupons-title">Coupon Management</h1>
                {!showAddForm ? (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="admin-coupons-add"
                    >
                        Add New Coupon
                    </button>
                ) : (
                    <button
                        onClick={cancelEdit}
                        className="admin-coupons-cancel"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {showAddForm && (
                <form onSubmit={handleSubmit} className="coupon-form">
                    <h2>{editMode ? 'Edit Coupon' : 'Add New Coupon'}</h2>
                    <div className="coupon-form-grid">
                        <div className="form-group">
                            <label className="form-label">Coupon Code</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className="form-input"
                                required
                                disabled={editMode}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Product Discount Type</label>
                            <select
                                name="productDiscountType"
                                value={formData.productDiscountType}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="none">None</option>
                                <option value="fixed">Fixed Amount</option>
                                <option value="percentage">Percentage</option>
                            </select>
                        </div>

                        {formData.productDiscountType !== 'none' && (
                            <div className="form-group">
                                <label className="form-label">Product Discount Value</label>
                                <input
                                    type="number"
                                    name="productDiscountValue"
                                    value={formData.productDiscountValue}
                                    onChange={handleChange}
                                    className="form-input"
                                    min="0"
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Shipping Discount Type</label>
                            <select
                                name="shippingDiscountType"
                                value={formData.shippingDiscountType}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="none">None</option>
                                <option value="free">Free Shipping</option>
                                <option value="fixed">Fixed Amount</option>
                                <option value="percentage">Percentage</option>
                            </select>
                        </div>

                        {formData.shippingDiscountType !== 'none' && formData.shippingDiscountType !== 'free' && (
                            <div className="form-group">
                                <label className="form-label">Shipping Discount Value</label>
                                <input
                                    type="number"
                                    name="shippingDiscountValue"
                                    value={formData.shippingDiscountValue}
                                    onChange={handleChange}
                                    className="form-input"
                                    min="0"
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Expiry Date</label>
                            <input
                                type="datetime-local"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Minimum Order Amount</label>
                            <input
                                type="number"
                                name="minOrderAmount"
                                value={formData.minOrderAmount}
                                onChange={handleChange}
                                className="form-input"
                                min="0"
                            />
                        </div>

                        {formData.productDiscountType === 'percentage' && (
                            <div className="form-group">
                                <label className="form-label">Maximum Discount</label>
                                <input
                                    type="number"
                                    name="maxDiscount"
                                    value={formData.maxDiscount}
                                    onChange={handleChange}
                                    className="form-input"
                                    min="0"
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Usage Limit Per User</label>
                            <input
                                type="number"
                                name="usageLimit"
                                value={formData.usageLimit}
                                onChange={handleChange}
                                className="form-input"
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="form-submit">
                        {editMode ? 'Update Coupon' : 'Create Coupon'}
                    </button>
                </form>
            )}

            <div className="coupon-table-container">
                <table className="coupon-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Product Discount</th>
                            <th>Shipping Discount</th>
                            <th>Min Order</th>
                            <th>Expiry Date</th>
                            <th>Usage Limit</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((coupon) => (
                            <tr key={coupon._id}>
                                <td>{coupon.code}</td>
                                <td>
                                    {coupon.discountOptions.productDiscount.type !== 'none'
                                        ? `${coupon.discountOptions.productDiscount.type === 'percentage'
                                            ? coupon.discountOptions.productDiscount.value + '%'
                                            : '৳' + coupon.discountOptions.productDiscount.value
                                        }`
                                        : 'None'}
                                </td>
                                <td>
                                    {coupon.discountOptions.shippingDiscount.type !== 'none'
                                        ? coupon.discountOptions.shippingDiscount.type === 'free'
                                            ? 'Free'
                                            : `${coupon.discountOptions.shippingDiscount.type === 'percentage'
                                                ? coupon.discountOptions.shippingDiscount.value + '%'
                                                : '৳' + coupon.discountOptions.shippingDiscount.value
                                            }`
                                        : 'None'}
                                </td>
                                <td>৳{coupon.minOrderAmount}</td>
                                <td>{format(new Date(coupon.expiryDate), 'MMM dd, yyyy HH:mm')}</td>
                                <td>{coupon.usageLimit}</td>
                                <td className="coupon-action-buttons">
                                    <button
                                        onClick={() => handleEdit(coupon._id)}
                                        className="edit-button"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon._id)}
                                        className="delete-button"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 