'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Error from '@/components/common/Error';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  // Clear error after timeout
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
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
    setShowError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission
    
    // Client-side validation
    const validationErrors = {};
    if (!formData.emailOrPhone.trim()) {
      validationErrors.emailOrPhone = 'Email or phone is required';
    }
    if (!formData.password) {
      validationErrors.password = 'Password is required';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // Stop submission if validation fails
    }
    
    setErrors({});
    setIsLoading(true);
    setShowError(false);

    try {
      const response = await login(formData);
      router.push('/dashboard');
    } catch (error) {
      // Don't log the error here since it's already logged in the service
      const errorMessage = error?.message || 'Failed to login. Please try again.';
      
      setErrors({
        general: errorMessage
      });
      setShowError(true);
      
      // Ensure we keep the form data after an error
      setFormData(prev => ({...prev}));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {showError && errors.general && (
        <Error 
          type="error" 
          message={errors.general}
          className="mb-4"
          onClose={() => setShowError(false)}
        />
      )}

      <div className="form-group">
        <label htmlFor="emailOrPhone">Email or Phone</label>
        <input
          type="text"
          id="emailOrPhone"
          name="emailOrPhone"
          value={formData.emailOrPhone}
          onChange={handleChange}
          className={errors.emailOrPhone ? 'error' : ''}
        />
        {errors.emailOrPhone && (
          <span className="error-message">{errors.emailOrPhone}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && (
          <span className="error-message">{errors.password}</span>
        )}
      </div>

      <Link href="/forgot-password" className="forgot-password">
        Forgot Password?
      </Link>

      <button 
        type="submit" 
        className="auth-button" 
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>

      <p className="auth-redirect">
        Don't have an account? <Link href="/register">Register</Link>
      </p>
    </form>
  );
}