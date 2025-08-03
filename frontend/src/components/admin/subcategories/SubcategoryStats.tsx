'use client';

import { useState, useEffect } from 'react';
import { FiBox, FiTag, FiCheckCircle } from 'react-icons/fi';

export default function SubcategoryStats({ subcategories }) {
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        totalProducts: 0,
        categoryCounts: {}
    });

    useEffect(() => {
        if (subcategories && subcategories.length > 0) {
            const active = subcategories.filter(cat => cat.isActive).length;
            const totalProducts = subcategories.reduce((sum, cat) => sum + (cat.productCount || 0), 0);
            
            // Count subcategories per parent category
            const categoryCounts = {};
            subcategories.forEach(subcat => {
                const categoryId = subcat.category._id || subcat.category;
                const categoryName = subcat.category.name || 'Unknown';
                
                if (!categoryCounts[categoryId]) {
                    categoryCounts[categoryId] = { count: 0, name: categoryName };
                }
                categoryCounts[categoryId].count += 1;
            });
            
            setStats({
                total: subcategories.length,
                active,
                inactive: subcategories.length - active,
                totalProducts,
                categoryCounts
            });
        }
    }, [subcategories]);

    return (
        <div className="subcategory-stats">
            <div className="subcategory-stat-box">
                <div className="stat-icon"><FiTag /></div>
                <div className="stat-content">
                    <h3>{stats.total}</h3>
                    <p>Total Subcategories</p>
                </div>
            </div>
            
            <div className="subcategory-stat-box">
                <div className="stat-icon active"><FiCheckCircle /></div>
                <div className="stat-content">
                    <h3>{stats.active}</h3>
                    <p>Active Subcategories</p>
                </div>
            </div>
            
            <div className="subcategory-stat-box">
                <div className="stat-icon"><FiBox /></div>
                <div className="stat-content">
                    <h3>{stats.totalProducts}</h3>
                    <p>Total Products</p>
                </div>
            </div>
            
            <div className="subcategory-distribution">
                <h3>Distribution by Category</h3>
                <div className="distribution-chart">
                    {Object.entries(stats.categoryCounts).map(([categoryId, data]) => (
                        <div key={categoryId} className="distribution-item">
                            <div className="distribution-label">{data.name}</div>
                            <div className="distribution-bar-container">
                                <div 
                                    className="distribution-bar" 
                                    style={{ 
                                        width: `${(data.count / stats.total) * 100}%`,
                                        minWidth: '10%' 
                                    }}
                                >
                                    {data.count}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 