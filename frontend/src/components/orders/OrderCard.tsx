import { useRouter } from 'next/navigation';
import styles from '@/app/styles/orders.css';

export default function OrderCard({ order }) {
    const router = useRouter();

    return (
        <div 
            className={styles.orderCard}
            onClick={() => router.push(`/orders/${order._id}`)}
        >
            <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                    <span className={styles.orderId}>Order #{order._id.slice(-6)}</span>
                    <span className={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <OrderStatus status={order.status} />
            </div>

            <div className={styles.orderItems}>
                {order.items.map(item => (
                    <div key={item._id} className={styles.item}>
                        <span>{item.product.name} x {item.quantity}</span>
                        <span>৳ {item.price * item.quantity}</span>
                    </div>
                ))}
            </div>

            <div className={styles.orderFooter}>
                <span>Total: ৳ {order.finalPrice}</span>
                <button className={styles.viewButton}>View Details</button>
            </div>
        </div>
    );
}

export function OrderStatus({ status }) {
    const getStatusColor = () => {
        switch (status) {
            case 'Processing': return styles.processing;
            case 'Shipped': return styles.shipped;
            case 'Delivered': return styles.delivered;
            case 'Cancelled': return styles.cancelled;
            default: return '';
        }
    };

    return (
        <div className={`${styles.status} ${getStatusColor()}`}>
            {status}
        </div>
    );
}

export function OrderItems({ items }) {
    return (
        <div className={styles.itemsContainer}>
            <h3>Order Items</h3>
            {items.map(item => (
                <div key={item._id} className={styles.item}>
                    <div className={styles.productInfo}>
                        <h4>{item.product.name}</h4>
                        <p>
                            Variant: {item.variantDetails.color} - {item.variantDetails.size}
                        </p>
                        <p>Quantity: {item.quantity}</p>
                    </div>
                    <div className={styles.itemPrice}>
                        ৳ {item.price * item.quantity}
                    </div>
                </div>
            ))}
        </div>
    );
}
