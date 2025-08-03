'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FiChevronDown, FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { subcategoryService } from '@/services/subcategoryService';

export default function CategoryFilters({ onHideFilters, isMobile, categoryId }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [subcategories, setSubcategories] = useState([]);
    const [activeSection, setActiveSection] = useState('subcategories');

    // Get selected subcategory from URL
    const selectedSubcategory = searchParams.get('subcategory') || '';

    // Load subcategories if categoryId is provided
    useEffect(() => {
        if (categoryId) {
            const fetchSubcategories = async () => {
                try {
                    const subcategoriesData = await subcategoryService.getSubcategoriesByCategory(categoryId);
                    setSubcategories(subcategoriesData);
                } catch (error) {
                    console.error('Error fetching subcategories:', error);
                }
            };
            fetchSubcategories();
        }
    }, [categoryId]);

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Highest Rated' }
    ];

    const toggleSection = (section) => {
        setActiveSection(prevSection => prevSection === section ? null : section);
    };

    const handleSortChange = (e) => {
        const params = new URLSearchParams(searchParams);
        params.set('sort', e.target.value);
        params.set('page', '1'); // Reset to page 1 when changing sort
        router.push(`?${params.toString()}`);
    };

    const handlePriceFilter = (min, max) => {
        const params = new URLSearchParams(searchParams);
        
        if (min) {
            params.set('minPrice', min);
        } else {
            params.delete('minPrice');
        }
        
        if (max) {
            params.set('maxPrice', max);
        } else {
            params.delete('maxPrice');
        }
        
        params.set('page', '1'); // Reset to page 1 when changing filters
        router.push(`?${params.toString()}`);
    };

    const handleSubcategoryChange = (subcategorySlug) => {
        const params = new URLSearchParams(searchParams);
        
        if (subcategorySlug) {
            params.set('subcategory', subcategorySlug);
        } else {
            params.delete('subcategory');
        }
        
        params.set('page', '1'); // Reset to page 1 when changing subcategory
        router.push(`?${params.toString()}`);
        
        if (isMobile) {
            onHideFilters();
        }
    };

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('minPrice');
        params.delete('maxPrice');
        params.delete('subcategory');
        params.set('sort', 'newest');
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    };
    
    const isAnyFilterActive = () => {
        return (
            searchParams.get('minPrice') || 
            searchParams.get('maxPrice') || 
            searchParams.get('subcategory') ||
            (searchParams.get('sort') && searchParams.get('sort') !== 'newest')
        );
    };

    // Use a different class for mobile vs desktop to ensure mobile filters appear correctly
    const containerClass = isMobile ? "product-filters mobile-filter" : "product-filters";

    return (
        <div className={containerClass}>
            <div className="filters-header">
                <div className="filters-title">
                    <h3>Filters</h3>
                </div>
                <div className="filters-actions">
                    <button 
                        className="clear-filters" 
                        onClick={clearFilters}
                        disabled={!isAnyFilterActive()}
                    >
                        <FiX />
                        Clear All
                    </button>
                    <button className="hide-filters" onClick={onHideFilters}>
                        Hide
                    </button>
                </div>
            </div>
            
            <div className="filter-sections">
                {/* Subcategory Filter Section */}
                {subcategories && subcategories.length > 0 && (
                    <div className="filter-section">
                        <div 
                            className="filter-section-header" 
                            onClick={() => toggleSection('subcategories')}
                        >
                            <h3 className="filter-title">Subcategories</h3>
                            <FiChevronDown 
                                className={`filter-toggle-icon ${activeSection === 'subcategories' ? 'expanded' : ''}`} 
                            />
                        </div>
                        {activeSection === 'subcategories' && (
                            <div className="subcategory-options">
                                <button 
                                    className={`subcategory-option ${!selectedSubcategory ? 'active' : ''}`}
                                    onClick={() => handleSubcategoryChange('')}
                                >
                                    All
                                </button>
                                {subcategories.map(subcategory => (
                                    <button 
                                        key={subcategory._id}
                                        className={`subcategory-option ${selectedSubcategory === subcategory.slug ? 'active' : ''}`}
                                        onClick={() => handleSubcategoryChange(subcategory.slug)}
                                    >
                                        {subcategory.name}
                                        {subcategory.productCount > 0 && 
                                            <span className="subcategory-count">({subcategory.productCount})</span>
                                        }
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Price Filter Section */}
                <div className="filter-section">
                    <div 
                        className="filter-section-header" 
                        onClick={() => toggleSection('price')}
                    >
                        <h3 className="filter-title">Price Range</h3>
                        <FiChevronDown 
                            className={`filter-toggle-icon ${activeSection === 'price' ? 'expanded' : ''}`} 
                        />
                    </div>
                    {activeSection === 'price' && (
                        <div className="price-filter-inputs">
                            <input
                                type="number"
                                placeholder="Min"
                                onChange={(e) => handlePriceFilter(e.target.value, searchParams.get('maxPrice'))}
                                value={searchParams.get('minPrice') || ''}
                                className="price-input"
                            />
                            <span className="price-separator">to</span>
                            <input
                                type="number"
                                placeholder="Max"
                                onChange={(e) => handlePriceFilter(searchParams.get('minPrice'), e.target.value)}
                                value={searchParams.get('maxPrice') || ''}
                                className="price-input"
                            />
                        </div>
                    )}
                </div>

                {/* Sort Options */}
                <div className="filter-section">
                    <div 
                        className="filter-section-header" 
                        onClick={() => toggleSection('sort')}
                    >
                        <h3 className="filter-title">Sort By</h3>
                        <FiChevronDown 
                            className={`filter-toggle-icon ${activeSection === 'sort' ? 'expanded' : ''}`} 
                        />
                    </div>
                    {activeSection === 'sort' && (
                        <div className="sort-options">
                            <div className="select-wrapper">
                                <select
                                    value={searchParams.get('sort') || 'newest'}
                                    onChange={handleSortChange}
                                    className="sort-select"
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <FiChevronDown className="select-icon" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
