'use client';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';

// Single cart item component
function CartItemRow({ item }) {
    const { updateCartItem, removeFromCart } = useCart();
    const [isUpdating, setIsUpdating] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleQuantityChange = async (newQuantity) => {
        if (newQuantity < 1 || isUpdating) return;
        setIsUpdating(true);
        try {
            await updateCartItem(item._id, newQuantity);
        } catch (error) {
            toast.error('Failed to update quantity');
        } finally {
            setIsUpdating(false);
        }
    };

    if (!item || !item.product) {
        return null;
    }

    const thumbnailImage = item.product.thumbnailImage || '/images/placeholder.png';

    return (
        <div className="cart-item">
            <div className="product-section">
                <div className="image-container">
                    {!imageError ? (
                        <Image
                            src={thumbnailImage}
                            alt={`Product image of ${item.product.name}`}
                            width={120}
                            height={120}
                            className="product-image"
                            onError={() => setImageError(true)}
                            priority={true}
                        />
                    ) : (
                        <div 
                            className="placeholder-image"
                            role="img" 
                            aria-label={`Placeholder for ${item.product.name}`}
                        >
                            {item.product.name?.charAt(0) || '?'}
                        </div>
                    )}
                </div>
                <div className="product-info">
                    <h3>{item.product.name}</h3>
                    <div className="variant-info">
                        <span>Color: {item.variant.color}</span>
                        <span>Size: {item.variant.size}</span>
                    </div>
                    <button 
                        onClick={() => removeFromCart(item._id)}
                        className="remove-button"
                    >
                        Remove
                    </button>
                </div>
            </div>

            <div className="quantity-section">
                <div className="quantity-controls">
                    <button 
                        onClick={() => handleQuantityChange(item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating}
                        className="quantity-button"
                    >
                        -
                    </button>
                    <span className={`quantity-value ${isUpdating ? 'updating' : ''}`}>
                        {item.quantity}
                    </span>
                    <button 
                        onClick={() => handleQuantityChange(item.quantity + 1)}
                        disabled={isUpdating}
                        className="quantity-button"
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="price-section">
                <span className="item-price">
                    ${(item.cost).toFixed(2)}
                </span>
                {item.quantity > 1 && (
                    <span className="unit-price">
                        (${(item.cost / item.quantity).toFixed(2)} each)
                    </span>
                )}
            </div>
        </div>
    );
}

// Cart items list component
export default function CartItems({ items }) {
    if (!items || !Array.isArray(items)) {
        return null;
    }

    return (
        <div className="cart-items">
            {items.map((item) => (
                <CartItemRow key={item._id} item={item} />
            ))}
        </div>
    );
}
