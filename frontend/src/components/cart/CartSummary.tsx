'use client';
import { useRouter } from 'next/navigation';

export default function CartSummary({ cart }) {
    const router = useRouter();

    return (
        <div className="cartSummary">
            <h2>Order Summary</h2>
            
            <div className="summaryItem">
                <span>Subtotal ({cart.items.length} items):</span>
                <span>${cart.totalPrice.toFixed(2)}</span>
            </div>

            <div className="cart-items-list">
                {cart.items.map((item) => (
                    <div key={item._id} className="summaryItem cart-item-brief">
                        <span>{item.product.name} ({item.variant.color}, {item.variant.size})</span>
                        <span>x{item.quantity}</span>
                    </div>
                ))}
            </div>

            <button 
                className="checkoutButton"
                onClick={() => router.push('/checkout')}
                disabled={!cart.items.length}
            >
                Proceed to Checkout
            </button>
        </div>
    );
}
