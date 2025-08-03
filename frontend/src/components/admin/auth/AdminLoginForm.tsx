'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import Error from '@/components/common/Error';
import { FiMail, FiLock } from 'react-icons/fi';

export default function AdminLoginForm() {
    const router = useRouter();
    const { loginAdmin } = useAdminAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Auto-hide error after timeout
    useEffect(() => {
        let timer;
        if (showError) {
            timer = setTimeout(() => {
                setShowError(false);
            }, 5000); // Hide error after 5 seconds
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [showError]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        setShowError(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Client-side validation
        if (!formData.email.trim()) {
            setError('Email is required');
            setShowError(true);
            return;
        }
        if (!formData.password) {
            setError('Password is required');
            setShowError(true);
            return;
        }
        
        setIsLoading(true);
        setError('');
        setShowError(false);

        try {
            await loginAdmin(formData);
            router.push('/admin/dashboard');
        } catch (error) {
            // Don't log here as it's already logged in the service
            const errorMessage = error?.message || 'Failed to login';
            setError(errorMessage);
            setShowError(true);
            
            // Ensure we keep the form data after an error
            setFormData(prev => ({...prev}));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-auth-form">
            {showError && error && (
                <Error
                    type="error"
                    message={error}
                    className="mb-4"
                    onClose={() => setShowError(false)}
                />
            )}

            <div className="form-group">
                <div className="input-wrapper">
                    {!formData.email && <FiMail className="input-icon" />}
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Admin Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="admin-input"
                    />
                </div>
            </div>

            <div className="form-group">
                <div className="input-wrapper">
                    {!formData.password && <FiLock className="input-icon" />}
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="admin-input"
                    />
                </div>
            </div>

            <button
                type="submit"
                className="admin-auth-button"
                disabled={isLoading}
            >
                {isLoading ? 'Signing in...' : 'Sign In as Admin'}
            </button>
        </form>
    );
} 