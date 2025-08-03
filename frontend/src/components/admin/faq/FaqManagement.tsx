'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSort } from 'react-icons/fa';
import { getAllFaqs, createFaq, updateFaq, deleteFaq } from '@/services/faqService';
import toast from 'react-hot-toast';

const FaqManagement = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [newFaq, setNewFaq] = useState({
        question: '',
        answer: '',
        order: 0,
        isActive: true
    });

    // Fetch all FAQs
    const fetchFaqs = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllFaqs();
            
            // Sort FAQs by order
            const sortedFaqs = response.data.sort((a, b) => a.order - b.order);
            setFaqs(sortedFaqs);
        } catch (err) {
            setError('Failed to fetch FAQs: ' + err.message);
            toast.error('Failed to fetch FAQs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    // Handle input change for new/edited FAQ
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        
        setNewFaq({
            ...newFaq,
            [name]: type === 'number' ? Number(val) : val
        });
    };

    // Handle adding a new FAQ
    const handleAddFaq = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError(null);
            
            await createFaq(newFaq);
            toast.success('FAQ added successfully');
            
            // Reset form and refresh the FAQ list
            setNewFaq({
                question: '',
                answer: '',
                order: faqs.length > 0 ? Math.max(...faqs.map(f => f.order)) + 1 : 0,
                isActive: true
            });
            
            fetchFaqs();
        } catch (err) {
            setError('Failed to add FAQ: ' + err.message);
            toast.error('Failed to add FAQ');
        } finally {
            setLoading(false);
        }
    };

    // Set up editing mode
    const handleEdit = (faq) => {
        // Scroll to top of the page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setIsEditing(true);
        setEditId(faq._id);
        setNewFaq({
            question: faq.question,
            answer: faq.answer,
            order: faq.order,
            isActive: faq.isActive
        });
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setNewFaq({
            question: '',
            answer: '',
            order: faqs.length > 0 ? Math.max(...faqs.map(f => f.order)) + 1 : 0,
            isActive: true
        });
    };

    // Handle updating a FAQ
    const handleUpdateFaq = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError(null);
            
            await updateFaq(editId, newFaq);
            toast.success('FAQ updated successfully');
            
            // Reset form, exit editing mode, and refresh the FAQ list
            setNewFaq({
                question: '',
                answer: '',
                order: faqs.length > 0 ? Math.max(...faqs.map(f => f.order)) + 1 : 0,
                isActive: true
            });
            setIsEditing(false);
            setEditId(null);
            
            fetchFaqs();
        } catch (err) {
            setError('Failed to update FAQ: ' + err.message);
            toast.error('Failed to update FAQ');
        } finally {
            setLoading(false);
        }
    };

    // Handle deleting a FAQ
    const handleDeleteFaq = async (id) => {
        if (!window.confirm('Are you sure you want to delete this FAQ?')) {
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            await deleteFaq(id);
            toast.success('FAQ deleted successfully');
            
            // Refresh the FAQ list
            fetchFaqs();
        } catch (err) {
            setError('Failed to delete FAQ: ' + err.message);
            toast.error('Failed to delete FAQ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="faq-management-container">            
            {error && <div className="alert alert-danger">{error}</div>}
            
            {/* Add/Edit FAQ Form */}
            <div className="card">
                <div className="card-header">
                    <h3>{isEditing ? 'Edit FAQ' : 'Add New FAQ'}</h3>
                </div>
                <div className="card-body">
                    <form onSubmit={isEditing ? handleUpdateFaq : handleAddFaq}>
                        <div className="form-group">
                            <label htmlFor="question">Question</label>
                            <input
                                type="text"
                                className="form-group"
                                id="question"
                                name="question"
                                value={newFaq.question}
                                onChange={handleInputChange}
                                placeholder="Enter FAQ question"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="answer">Answer</label>
                            <textarea
                                className="form-group"
                                id="answer"
                                name="answer"
                                rows="4"
                                value={newFaq.answer}
                                onChange={handleInputChange}
                                placeholder="Enter FAQ answer (supports plain text only)"
                                required
                            ></textarea>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="order">Display Order</label>
                            <div className="input-group">
                                <input
                                    type="number"
                                    className="form-group"
                                    id="order"
                                    name="order"
                                    value={newFaq.order}
                                    onChange={handleInputChange}
                                    min="0"
                                />
                            </div>
                            <small className="form-text text-muted">Lower numbers appear first on the page</small>
                        </div>
                        
                        <div className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="isActive"
                                name="isActive"
                                checked={newFaq.isActive}
                                onChange={handleInputChange}
                            />
                            <label className="form-check-label" htmlFor="isActive">
                                Display this FAQ on the site
                            </label>
                        </div>
                        
                        <div className="faq-button-group">
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {isEditing ? <FaSave className="btn-icon" /> : <FaPlus className="btn-icon" />}
                                {isEditing ? 'Update FAQ' : 'Add FAQ'}
                            </button>
                            
                            {isEditing && (
                                <button 
                                    type="button" 
                                    className="btn btn-secondary cancel-edit-button"
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            
            {/* FAQ List */}
            <div className="card">
                <div className="card-header header-with-badge">
                    <h3>Existing FAQs</h3>
                    <span className="badge bg-info">{faqs.length} FAQs</span>
                </div>
                <div className="card-body">
                    {loading && faqs.length === 0 ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading FAQs...</p>
                        </div>
                    ) : faqs.length === 0 ? (
                        <div className="empty-state">
                            <p className="text-center">No FAQs found. Add your first FAQ using the form above.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th style={{ width: '70px' }}>Order</th>
                                        <th style={{ width: '30%' }}>Question</th>
                                        <th>Answer</th>
                                        <th style={{ width: '100px' }}>Status</th>
                                        <th style={{ width: '120px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {faqs.map((faq) => (
                                        <tr key={faq._id}>
                                            <td>{faq.order}</td>
                                            <td className="question-column">{faq.question}</td>
                                            <td>
                                                {faq.answer.length > 100
                                                    ? `${faq.answer.substring(0, 100)}...`
                                                    : faq.answer
                                                }
                                            </td>
                                            <td>
                                                <span className={`badge ${faq.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                    {faq.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="btn-group" role="group">
                                                    <button
                                                        className="btn btn-sm btn-info me-2"
                                                        onClick={() => handleEdit(faq)}
                                                        disabled={loading}
                                                        title="Edit FAQ"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDeleteFaq(faq._id)}
                                                        disabled={loading}
                                                        title="Delete FAQ"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FaqManagement; 