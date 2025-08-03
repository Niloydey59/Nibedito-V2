'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { FiMinus, FiPlus, FiShoppingCart, FiStar } from 'react-icons/fi';
import { productService } from '@/services/productService';
import { useCart } from '@/contexts/CartContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ImageMagnifier from '@/components/products/ImageMagnifier';
import { toast } from 'react-hot-toast';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';

export default function ProductDetailsPage() {
    const { slug } = useParams();
    const { addToCart, cart } = useCart();
    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await productService.getProduct(slug);
                setProduct(data);
                setSelectedImage(data.thumbnailImage);
                if (data.variants?.length > 0) {
                    setSelectedVariant(data.variants[0]);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch product');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug]);

    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
        if (variant.images?.length > 0) {
            setSelectedImage(variant.images[0]);
        }
        
        // Check if this variant is in cart and update quantity
        const existingCartItem = cart?.items?.find(item => 
            item.product._id === product._id && 
            item.variant._id === variant._id
        );
        
        // Set initial quantity to 1 or existing cart quantity
        setQuantity(existingCartItem ? existingCartItem.quantity : 1);
    };

    const handleAddToCart = async () => {
        try {
            if (!selectedVariant) {
                toast.error('Please select a variant');
                return;
            }

            // Check if this variant is already in cart
            const existingCartItem = cart?.items?.find(item => 
                item.product._id === product._id && 
                item.variant._id === selectedVariant._id
            );

            const success = await addToCart(product._id, quantity, selectedVariant._id);
            if (success) {
                toast.success(existingCartItem ? 'Cart updated successfully!' : 'Added to cart successfully!');
            } else {
                toast.error('Failed to update cart');
            }
        } catch (error) {
            toast.error('Error updating cart');
            console.error('Add to cart error:', error);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="error-container">{error}</div>;
    if (!product) return null;

    return (
        <main className="product-details-page">
            <div className="container">
                <div className="product-details-grid">
                    <div className="product-left-column">
                        <div className="product-gallery">
                            <div className="main-image">
                                <ImageMagnifier
                                    src={selectedImage || product.thumbnailImage}
                                    alt={product.name}
                                    width={600}
                                    height={600}
                                />
                            </div>
                            <div className="image-thumbnails">
                                <button 
                                    className={`thumbnail-btn ${selectedImage === product.thumbnailImage ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(product.thumbnailImage)}
                                >
                                    <Image
                                        src={product.thumbnailImage}
                                        alt="Main product"
                                        width={100}
                                        height={100}
                                    />
                                </button>
                                {selectedVariant?.images?.map((image, idx) => (
                                    <button
                                        key={idx}
                                        className={`thumbnail-btn ${selectedImage === image ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(image)}
                                    >
                                        <Image
                                            src={image}
                                            alt={`Variant ${idx + 1}`}
                                            width={100}
                                            height={100}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {product.variants?.length > 0 && (
                            <div className="variants-section">
                                <h3>Available Variants</h3>
                                <div className="variants-list">
                                    {product.variants.map((variant, index) => (
                                        <label 
                                            key={index}
                                            className={`variant-item ${selectedVariant === variant ? 'active' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="variant"
                                                checked={selectedVariant === variant}
                                                onChange={() => handleVariantSelect(variant)}
                                                disabled={variant.quantity === 0}
                                            />
                                            <div className="variant-preview">
                                                <Image
                                                    src={variant.images[0] || product.thumbnailImage}
                                                    alt={variant.color}
                                                    width={50}
                                                    height={50}
                                                />
                                            </div>
                                            <div className="variant-details">
                                                <div className="variant-main-info">
                                                    <span className="variant-color">{variant.color}</span>
                                                    <span className="variant-size">{variant.size}</span>
                                                </div>
                                                <div className="variant-meta">
                                                    {variant.quantity === 0 && (
                                                        <span className="out-of-stock">Out of Stock</span>
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="product-info">
                        <h1 className="product-title">{product.name}</h1>
                        <div className="product-meta">
                            <div className="price-rating">
                                <span className="product-price">
                                    ৳ {selectedVariant?.price || product.price}
                                </span>
                                <span className="product-rating">
                                    <FiStar /> {product.averageRating || 0}
                                </span>
                            </div>
                            {product.category && (
                                <span className="product-category">
                                    Category: {product.category.name}
                                </span>
                            )}
                        </div>

                        <div className="product-description">
                            <MarkdownRenderer markdown={product.description} />
                        </div>

                        <div className="purchase-section">
                            <div className="quantity-selector">
                                <button 
                                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <FiMinus />
                                </button>
                                <span>{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(prev => prev + 1)}
                                    disabled={selectedVariant && quantity >= selectedVariant.quantity}
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            <button 
                                className="add-to-cart-btn"
                                onClick={handleAddToCart}
                                disabled={!selectedVariant || selectedVariant.quantity === 0}
                            >
                                <FiShoppingCart />
                                {cart?.items?.find(item => 
                                    item.product._id === product._id && 
                                    item.variant._id === selectedVariant?._id
                                ) ? 'Update Cart' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
} 