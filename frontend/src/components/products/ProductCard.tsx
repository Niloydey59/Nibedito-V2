"use client";

import Image from "next/image";
import Link from "next/link";
import { FiShoppingCart, FiStar } from "react-icons/fi";
import { useEffect, useRef } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import MarkdownRenderer from "@/components/common/MarkdownRenderer";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

export default function ProductCard({
  product,
  viewMode = "grid",
}: ProductCardProps) {
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const { _id, slug, name, description, price, thumbnailImage, variants } =
    product;

  const isMobile = useRef<boolean>(
    typeof window !== "undefined" && window.innerWidth <= 768
  );

  useEffect(() => {
    const description = document.querySelector(
      `#product-${_id} .product-description`
    );
    if (description && description.scrollHeight > description.clientHeight) {
      description.classList.add("truncated");
    }
  }, [_id]);

  const handleAddToCart = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault(); // Prevent the event from bubbling up to the Link component

    // Check if user is logged in
    if (!user) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }

    try {
      // Check if variants exist
      if (!variants || variants.length === 0) {
        toast.error("No variants available for this product");
        return;
      }

      const defaultVariant = variants[0];

      // Check if this variant is already in cart
      const existingCartItem = cart?.items?.find(
        (item) =>
          item.product._id === _id && item.variant._id === defaultVariant._id
      );

      if (existingCartItem) {
        // If item exists, increase quantity by 1
        const success = await addToCart(
          _id,
          existingCartItem.quantity + 1,
          defaultVariant._id
        );
        if (success) {
          toast.success("Updated quantity in cart");
        } else {
          toast.error("Failed to update cart");
        }
      } else {
        // If item doesn't exist, add new item with quantity 1
        const success = await addToCart(_id, 1, defaultVariant._id);
        if (success) {
          toast.success("Added to cart successfully!");
        } else {
          toast.error("Failed to add to cart");
        }
      }
    } catch (error) {
      toast.error("Error adding to cart");
      console.error("Add to cart error:", error);
    }
  };

  // Render different layouts based on viewMode
  if (viewMode === "list") {
    return (
      <div id={`product-${_id}`} className="product-card product-card-list">
        <Link href={`/products/${slug}`} className="product-link-list">
          <div className="product-image-list">
            <Image
              src={thumbnailImage || "/images/placeholder.jpg"}
              alt={name}
              width={120}
              height={120}
              className="product-img-list"
              sizes="120px"
            />
          </div>
          <div className="product-info-list">
            <div className="product-details-list">
              <h3 className="product-name-list">{name}</h3>
              <div className="product-description-preview-list">
                <MarkdownRenderer
                  markdown={
                    description.slice(0, 80) +
                    (description.length > 80 ? "..." : "")
                  }
                  disableLinks={true}
                />
              </div>
            </div>
            <div className="product-meta-list">
              <span className="product-rating-list">
                <FiStar /> 0.0
              </span>
              <p className="product-price-list">৳ {price.toFixed(2)}</p>
              <button
                className="btn btn-primary btn-cart-list"
                onClick={handleAddToCart}
              >
                <FiShoppingCart />
                <span>Add</span>
              </button>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Original grid view
  return (
    <div id={`product-${_id}`} className="product-card">
      <Link href={`/products/${slug}`} className="product-link">
        <div className="product-image">
          <Image
            src={thumbnailImage || "/images/placeholder.jpg"}
            alt={name}
            width={300}
            height={300}
            className="product-img"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="product-overlay">
            <button
              className="btn btn-primary btn-cart"
              onClick={handleAddToCart}
            >
              <FiShoppingCart />
              <span>{isMobile.current ? "Add" : "Add to Cart"}</span>
            </button>
          </div>
        </div>
        <div className="product-info">
          <h3 className="product-name">{name}</h3>
          <div className="product-description-preview">
            <MarkdownRenderer markdown={description} disableLinks={true} />
          </div>
          <div className="product-footer">
            <p className="product-price">৳ {price.toFixed(2)}</p>
            <span className="product-rating">
              <FiStar /> 0.0
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
