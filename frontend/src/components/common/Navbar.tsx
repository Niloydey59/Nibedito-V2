"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { categoryService } from "@/services/categoryService";
import { getImageUrl } from "@/utils/imageUtils";
import { useCart } from "@/contexts/CartContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "next-themes";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function Navbar() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const { cart } = useCart();
  const itemCount =
    cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const activeCategories = await categoryService.getActiveCategories();
        setCategories([
          { _id: "all", name: "All Categories", slug: "all" },
          ...activeCategories,
        ]);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Listen for the clear-navbar-search event
  useEffect(() => {
    const handleClearSearch = () => {
      setSearchQuery("");
    };

    window.addEventListener("clear-navbar-search", handleClearSearch);

    return () => {
      window.removeEventListener("clear-navbar-search", handleClearSearch);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();

    if (searchQuery) {
      searchParams.set("search", searchQuery);
    }

    if (selectedCategory && selectedCategory !== "all") {
      router.push(
        `/products/category/${selectedCategory}?${searchParams.toString()}`
      );
    } else {
      router.push(`/products?${searchParams.toString()}`);
    }

    // Close mobile menu and search after search
    setIsMobileMenuOpen(false);
    setIsSearchVisible(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsSearchVisible(false);
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    setIsMobileMenuOpen(false);
  };

  const renderProfileLink = () => {
    if (!user) return null;

    return (
      <Link
        href="/dashboard"
        className="relative w-9 h-9 rounded-full overflow-hidden bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 transition-all duration-200 hover:border-rose-600 dark:hover:border-rose-400 hover:shadow-md hover:-translate-y-0.5"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {user.profilePicture ? (
          <Image
            src={getImageUrl(user.profilePicture)}
            alt={user.name}
            width={35}
            height={35}
            className="w-full h-full object-cover rounded-full"
            priority={true}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-600 to-rose-700 text-white text-sm font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </Link>
    );
  };

  const CartCount = () => {
    return (
      <Link
        href="/cart"
        className="relative flex items-center justify-center p-2 rounded-full text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <FiShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs font-semibold min-w-[18px] h-[18px] rounded-full flex items-center justify-center animate-pulse">
            {itemCount}
          </span>
        )}
      </Link>
    );
  };

  // Get the appropriate logo based on theme
  const getLogoSrc = () => {
    if (!mounted) return "/images/logo-black.png"; // Default fallback
    const currentTheme = resolvedTheme || theme;
    return currentTheme === "dark"
      ? "/images/logo-white.png"
      : "/images/logo-black.png";
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-200"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <FiX className="w-5 h-5" />
            ) : (
              <FiMenu className="w-5 h-5" />
            )}
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src={getLogoSrc()}
              alt="Nibedito"
              width={120}
              height={40}
              priority
              className="h-8 lg:h-10 w-auto transition-opacity duration-200"
              key={mounted ? resolvedTheme || theme : "fallback"} // Force re-render on theme change
            />
          </Link>

          {/* Desktop Search - Always visible on desktop */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <form
              onSubmit={handleSearch}
              className="flex w-full bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1 gap-1"
            >
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-transparent text-slate-700 dark:text-slate-300 text-sm font-medium border-none outline-none cursor-pointer min-w-[120px] rounded-md"
              >
                {categories.map((category) => (
                  <option
                    key={category.slug}
                    value={category.slug}
                    className="bg-white dark:bg-slate-800"
                  >
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-500 dark:placeholder-slate-400 border-none outline-none text-sm rounded-md"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-md transition-colors duration-200"
              >
                Search
              </button>
            </form>
          </div>

          {/* Desktop Navigation Links - Always visible on desktop */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/products"
              className="text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors duration-200"
            >
              Products
            </Link>

            {user && (
              <Link
                href="/my-orders"
                className="text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors duration-200"
              >
                My Orders
              </Link>
            )}

            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-3">
                <CartCount />
                {renderProfileLink()}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="relative inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-rose-700 to-rose-600 text-white font-medium rounded-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 group [&_*::selection]:bg-white/30 [&_*::selection]:text-white [&_*::-moz-selection]:bg-white/30 [&_*::-moz-selection]:text-white"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-rose-800 to-rose-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-[-1]"></span>
                  <span className="relative z-10 text-white [&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white">
                    Register
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile actions - Only visible on mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200"
              onClick={toggleSearch}
            >
              <FiSearch className="w-5 h-5" />
            </button>
            {user && (
              <Link
                href="/cart"
                className="relative p-2 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs font-semibold min-w-[14px] h-[14px] rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* Mobile search container */}
          {isSearchVisible && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shadow-lg transition-all duration-200">
              <form onSubmit={handleSearch} className="space-y-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md text-sm"
                >
                  {categories.map((category) => (
                    <option
                      key={category.slug}
                      value={category.slug}
                      className="bg-white dark:bg-slate-800"
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder-slate-500 dark:placeholder-slate-400 border border-slate-200 dark:border-slate-700 rounded-md text-sm"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-md transition-colors duration-200"
                >
                  Search
                </button>
              </form>
            </div>
          )}

          {/* Mobile navigation menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg transition-all duration-200">
              <div className="p-4 space-y-3">
                <Link
                  href="/products"
                  className="block px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium rounded-md transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Products
                </Link>

                {user && (
                  <Link
                    href="/my-orders"
                    className="block px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium rounded-md transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                )}

                {user ? (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 px-3 py-2">
                      {renderProfileLink()}
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {user.name}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <Link
                      href="/login"
                      className="block px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium rounded-md transition-all duration-200 text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="relative inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-rose-700 to-rose-600 text-white font-medium rounded-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 group text-center [&_*::selection]:bg-white/30 [&_*::selection]:text-white [&_*::-moz-selection]:bg-white/30 [&_*::-moz-selection]:text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-rose-800 to-rose-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-[-1]"></span>
                      <span className="relative z-10 text-white [&::selection]:bg-white/30 [&::selection]:text-white [&::-moz-selection]:bg-white/30 [&::-moz-selection]:text-white">
                        Register
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
