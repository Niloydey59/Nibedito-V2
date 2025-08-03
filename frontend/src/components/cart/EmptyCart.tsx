'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function EmptyCart() {
    return (
        <div className="emptyCartContainer">
            <div className="emptyCart">
                <div className="emptyCartIcon">
                    <Image
                        src="/images/empty-cart.svg"
                        alt="Empty Cart"
                        width={150}
                        height={150}
                        priority
                    />
                </div>
                <h2 className="emptyCartTitle">Your Cart is Empty</h2>
                <p className="emptyCartText">
                    Looks like you haven't added anything to your cart yet.
                </p>
                <p className="suggestion">
                    Browse our products and find something you like!
                </p>
                <Link href="/products" className="shopButton">
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}
