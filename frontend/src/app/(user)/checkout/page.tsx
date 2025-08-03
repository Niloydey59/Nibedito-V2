'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { previewCoupon, applyCoupon } from '@/services/couponService';

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, loading: cartLoading, clearCart, refetchCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [shippingRates, setShippingRates] = useState([]);
    const [selectedShipping, setSelectedShipping] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [applying, setApplying] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        addressDetails: '',
        phone: '',
        email: ''
    });
    const [isGift, setIsGift] = useState(false);
    const [giftNote, setGiftNote] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/login?redirect=/checkout');
            return;
        }

        if (!cartLoading && (!cart || !cart.items?.length) && !orderPlaced) {
            router.push('/cart');
            return;
        }

        // Find default address
        const defaultAddress = user.addresses?.find(addr => addr.isDefault) || user.addresses?.[0];

        // Initialize form data with user info and default address
        setFormData({
            street: defaultAddress?.street || '',
            city: defaultAddress?.city || '',
            state: defaultAddress?.state || '',
            addressDetails: '',
            phone: user.phone || '',
            email: user.email || ''
        });

        fetchShippingRates();
    }, [user, cart, cartLoading, orderPlaced]);

    // Effect to handle redirection after order placement
    useEffect(() => {
        if (orderPlaced) {
            router.push('/my-orders');
        }
    }, [orderPlaced, router]);

    const fetchShippingRates = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipping/rates`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setShippingRates(data.payload);
                setSelectedShipping(data.payload[0]?.region || '');
            }
            setLoading(false);
        } catch (error) {
            console.error('Shipping error:', error);
            toast.error('Failed to fetch shipping rates');
            setLoading(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }

        setApplying(true);
        try {
            const data = await previewCoupon({
                couponCode,
                shippingRegion: selectedShipping
            });

            if (data.success) {
                toast.success('Coupon preview calculated');
                setAppliedCoupon({
                    code: couponCode,
                    couponId: data.payload.couponId,
                    productDiscountAmount: data.payload.productDiscountAmount,
                    shippingDiscountAmount: data.payload.shippingDiscountAmount,
                    finalPrice: data.payload.finalPrice,
                    finalShippingCost: data.payload.finalShippingCost
                });
            } else {
                toast.error(data.message || 'Failed to preview coupon');
                setCouponCode('');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to preview coupon');
            setCouponCode('');
        } finally {
            setApplying(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedShipping) {
            toast.error('Please select a shipping region');
            return;
        }

        try {
            setLoading(true);
            // Format phone number by removing +880 prefix if present
            const formattedPhone = formData.phone.replace(/^\+?880/, '');
            
            // We'll use the preview data directly instead of calling applyCoupon again
            // This prevents double-counting of coupon usage
            let couponData = null;
            if (appliedCoupon) {
                couponData = {
                    couponId: appliedCoupon.couponId,
                    code: appliedCoupon.code,
                    productDiscountAmount: appliedCoupon.productDiscountAmount,
                    shippingDiscountAmount: appliedCoupon.shippingDiscountAmount,
                    finalPrice: appliedCoupon.finalPrice
                };
            }

            // Create order
            const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    cartId: cart._id,
                    ...formData,
                    phone: formattedPhone,
                    paymentMethod: 'Cash on Delivery',
                    couponId: couponData?.couponId,
                    couponCode: couponData?.code,
                    productDiscountAmount: couponData?.productDiscountAmount || 0,
                    shippingDiscountAmount: couponData?.shippingDiscountAmount || 0,
                    finalPrice: couponData?.finalPrice || (cart.totalPrice + (shippingRates.find(r => r.region === selectedShipping)?.cost || 0)),
                    shippingRegion: selectedShipping,
                    isGift,
                    giftNote
                })
            });

            const orderData = await orderResponse.json();
            if (orderData.success) {
                toast.success('Order placed successfully!');
                // Clear cart after successful order using the context function
                await clearCart();
                // Refetch cart to update the UI
                await refetchCart();
                // Set order placed flag to trigger redirect
                setOrderPlaced(true);
            } else {
                throw new Error(orderData.message);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length <= 10) {
            setFormData(prev => ({ ...prev, phone: value }));
        }
    };

    if (loading || cartLoading) {
        return <div className="loading">Loading...</div>;
    }

    // No conditional redirect here, that's handled in useEffect
    if (!cart || !cart.items?.length) {
        return <div className="loading">No items in cart...</div>;
    }

    const currentShippingRate = shippingRates.find(r => r.region === selectedShipping)?.cost || 0;
    const subtotal = cart.totalPrice;
    const shippingCost = appliedCoupon?.finalShippingCost ?? currentShippingRate;
    const productDiscount = appliedCoupon?.productDiscountAmount || 0;
    const shippingDiscount = appliedCoupon?.shippingDiscountAmount || 0;
    const total = appliedCoupon?.finalPrice || (subtotal + currentShippingRate);

    return (
        <div className="checkout-container">
            <div className="checkout-content">
                <div className="shipping-form">
                    <h2>Shipping Information</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group checkout-form-group">
                            <label>Street Address</label>
                            <input
                                type="text"
                                value={formData.street}
                                onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                                placeholder="Enter your street address"
                                required
                            />
                        </div>

                        <div className="form-group checkout-form-group">
                            <label>City</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                placeholder="Enter your city"
                                required
                            />
                        </div>

                        <div className="form-group checkout-form-group">
                            <label>State</label>
                            <input
                                type="text"
                                value={formData.state}
                                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                                placeholder="Enter your state"
                                required
                            />
                        </div>

                        <div className="form-group checkout-form-group">
                            <label>Additional Address Details (Optional)</label>
                            <textarea
                                value={formData.addressDetails}
                                onChange={(e) => setFormData(prev => ({ ...prev, addressDetails: e.target.value }))}
                                placeholder="Add any additional address details, landmarks, or delivery instructions"
                                rows={2}
                                maxLength={200}
                            />
                            <small className="character-count">{formData.addressDetails.length}/200</small>
                        </div>

                        <div className="form-group checkout-form-group">
                            <label>Phone</label>
                            <div className="phone-input-group">
                                <span className="country-code">+880</span>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    placeholder="Enter your phone number"
                                    maxLength="10"
                                    pattern="[0-9]{10}"
                                    required
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="form-group checkout-form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="gift-option-section">
                            <h3 className="sectionTitle">Gift Options</h3>
                            <div className="gift-toggle">
                                <div className="toggle-option">
                                    <input 
                                        type="radio" 
                                        id="self" 
                                        name="giftOption" 
                                        checked={!isGift} 
                                        onChange={() => setIsGift(false)}
                                    />
                                    <label htmlFor="self">Buy for Self</label>
                                </div>
                                <div className="toggle-option">
                                    <input 
                                        type="radio" 
                                        id="gift" 
                                        name="giftOption" 
                                        checked={isGift} 
                                        onChange={() => setIsGift(true)}
                                    />
                                    <label htmlFor="gift">Gift Someone</label>
                                </div>
                            </div>
                            
                            {isGift && (
                                <div className="form-group checkout-form-group">
                                    <label>Gift Note</label>
                                    <textarea
                                        value={giftNote}
                                        onChange={(e) => setGiftNote(e.target.value)}
                                        placeholder="Add a personal message for the gift recipient"
                                        rows={4}
                                        maxLength={200}
                                    />
                                    <small className="character-count">{giftNote.length}/200</small>
                                </div>
                            )}
                        </div>

                        <div className="form-group checkout-form-group">
                            <label>Shipping Region</label>
                            <select
                                value={selectedShipping}
                                onChange={(e) => {
                                    setSelectedShipping(e.target.value);
                                    setAppliedCoupon(null); // Reset coupon when shipping changes
                                }}
                                required
                            >
                                {shippingRates.map((rate) => (
                                    <option key={rate._id} value={rate.region}>
                                        {rate.region} - ${rate.cost}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="couponSection">
                            <h3 className="sectionTitle">Have a Coupon?</h3>
                            {appliedCoupon ? (
                                <div className="appliedCoupon">
                                    <div className="couponInfo">
                                        <div className="couponDetails">
                                            <span className="couponLabel">Applied Coupon:</span>
                                            <span className="couponCode">{appliedCoupon.code}</span>
                                        </div>
                                        <div className="discountAmount">
                                            -৳{(appliedCoupon.productDiscountAmount + appliedCoupon.shippingDiscountAmount).toFixed(2)}
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={handleRemoveCoupon}
                                        className="removeCouponButton"
                                    >
                                        Remove Coupon
                                    </button>
                                </div>
                            ) : (
                                <div className="couponForm">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="Enter coupon code"
                                        className="couponInput"
                                        disabled={applying}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        className="couponButton"
                                        disabled={applying}
                                    >
                                        {applying ? 'Applying...' : 'Apply'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="order-summary">
                            <h3>Order Summary</h3>
                            <div className="summary-item">
                                <span>Subtotal</span>
                                <span>৳{parseFloat(cart.totalPrice).toFixed(2)}</span>
                            </div>
                            <div className="summary-item">
                                <span>Shipping</span>
                                <span>৳{parseFloat(selectedShipping ? shippingRates.find(rate => rate.region === selectedShipping)?.cost || 0 : 0).toFixed(2)}</span>
                            </div>
                            {appliedCoupon && appliedCoupon.productDiscountAmount > 0 && (
                                <div className="summary-item discount">
                                    <span>Product Discount</span>
                                    <span>-৳{parseFloat(appliedCoupon.productDiscountAmount).toFixed(2)}</span>
                                </div>
                            )}
                            {appliedCoupon && appliedCoupon.shippingDiscountAmount > 0 && (
                                <div className="summary-item discount">
                                    <span>Shipping Discount</span>
                                    <span>-৳{parseFloat(appliedCoupon.shippingDiscountAmount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="summary-item total">
                                <span>Total</span>
                                <span>৳{parseFloat(appliedCoupon ? appliedCoupon.finalPrice : (cart.totalPrice + (selectedShipping ? shippingRates.find(rate => rate.region === selectedShipping)?.cost || 0 : 0))).toFixed(2)}</span>
                            </div>
                        </div>

                        <button type="submit" className="place-order-button">
                            Place Order (Cash on Delivery)
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
