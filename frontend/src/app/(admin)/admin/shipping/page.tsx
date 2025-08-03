'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getShippingRates, createShippingRate, updateShippingRate, deleteShippingRate, initializeDefaultRates } from '@/services/shippingService';

export default function ShippingManagement() {
    const router = useRouter();
    const { admin, loading: authLoading } = useAdminAuth();
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newRate, setNewRate] = useState({
        region: '',
        cost: '',
        description: ''
    });
    const [editMode, setEditMode] = useState(false);
    const [editingRate, setEditingRate] = useState(null);

    useEffect(() => {
        // Wait for auth to be initialized
        if (authLoading) return;

        // Check if user is not admin
        if (!admin) {
            toast.error('Admin access required');
            router.push('/admin-login');
            return;
        }

        fetchRates();
    }, [admin, authLoading]);

    const fetchRates = async () => {
        try {
            const data = await getShippingRates();
            setRates(data);
        } catch (error) {
            toast.error('Failed to fetch shipping rates');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode && editingRate) {
                const response = await updateShippingRate(editingRate._id, {
                    cost: newRate.cost,
                    description: newRate.description
                });
                
                toast.success('Shipping rate updated successfully');
                setEditMode(false);
                setEditingRate(null);
            } else {
                await createShippingRate(newRate);
                toast.success('Shipping rate created successfully');
            }
            
            setNewRate({ region: '', cost: '', description: '' });
            fetchRates();
        } catch (error) {
            toast.error(error.message || 'Failed to save shipping rate');
        }
    };

    const handleDelete = async (rateId) => {
        if (!confirm('Are you sure you want to delete this shipping rate?')) return;
        
        try {
            await deleteShippingRate(rateId);
            toast.success('Shipping rate deleted successfully');
            fetchRates();
        } catch (error) {
            toast.error(error.message || 'Failed to delete shipping rate');
        }
    };

    const handleInitializeDefault = async () => {
        try {
            await initializeDefaultRates();
            toast.success('Default shipping rates initialized');
            fetchRates();
        } catch (error) {
            toast.error(error.message || 'Failed to initialize default rates');
        }
    };

    const handleEdit = (rate) => {
        // Scroll to top of the page BEFORE state updates
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Delay the state updates slightly to ensure scroll completes first
        setTimeout(() => {
            setEditMode(true);
            setEditingRate(rate);
            setNewRate({
                region: rate.region,
                cost: rate.cost,
                description: rate.description || ''
            });
        }, 50);
    };

    const cancelEdit = () => {
        setEditMode(false);
        setEditingRate(null);
        setNewRate({ region: '', cost: '', description: '' });
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="admin-container">
            <h1>Shipping Management</h1>

            <div className="form-section">
                <h2>{editMode ? 'Edit Shipping Rate' : 'Add New Shipping Rate'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Region Name</label>
                        <input
                            type="text"
                            value={newRate.region}
                            onChange={(e) => setNewRate(prev => ({ ...prev, region: e.target.value }))}
                            required={!editMode}
                            placeholder="Enter region name"
                            disabled={editMode}
                        />
                    </div>

                    <div className="form-group">
                        <label>Cost (BDT)</label>
                        <input
                            type="number"
                            min="0"
                            value={newRate.cost}
                            onChange={(e) => setNewRate(prev => ({ ...prev, cost: e.target.value }))}
                            required
                            placeholder="Enter shipping cost"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={newRate.description}
                            onChange={(e) => setNewRate(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter shipping description"
                        />
                    </div>

                    <div className="button-group">
                        <button type="submit" className="btn-primary">
                            {editMode ? 'Update Shipping Rate' : 'Add Shipping Rate'}
                        </button>
                        
                        {editMode && (
                            <button 
                                type="button" 
                                onClick={cancelEdit} 
                                className="btn-secondary cancel-edit-button"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                {!editMode && (
                    <button 
                        onClick={handleInitializeDefault}
                        className="btn-secondary"
                    >
                        Initialize Default Rates
                    </button>
                )}
            </div>

            <div className="rates-section">
                <h2>Current Shipping Rates</h2>
                <div className="rates-grid">
                    {rates.map((rate) => (
                        <div key={rate._id} className="rate-card">
                            <h3>{rate.region}</h3>
                            <p className="cost">৳{rate.cost}</p>
                            <p className="description">{rate.description}</p>
                            <div className="rate-actions">
                                <button
                                    onClick={() => handleEdit(rate)}
                                    className="btn-primary"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(rate._id)}
                                    className="btn-danger"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 