'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiCamera, FiEdit2, FiPlus } from 'react-icons/fi';
import { FaMapMarkerAlt, FaPlus } from 'react-icons/fa';
import { MdEdit } from 'react-icons/md';
import Error from '@/components/common/Error';
import userService from '@/services/userService';
import { uploadImage, getImageUrl } from '@/utils/imageUtils';
import axios from '@/utils/axios';

export default function UserProfile({ user: initialUser }) {
    const [user, setUser] = useState(initialUser);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(user?.addresses?.[0]?._id || '');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [formData, setFormData] = useState({
        name: initialUser?.name || '',
        phone: initialUser?.phone || '',
    });
    const [addressFormData, setAddressFormData] = useState({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        isDefault: false
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        if (user && Object.keys(user).length > 0) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
            });
            // Set the selected address to the default address if it exists
            const defaultAddress = user.addresses?.find(addr => addr.isDefault);
            if (defaultAddress) {
                setSelectedAddressId(defaultAddress._id);
            } else if (user.addresses?.[0]) {
                setSelectedAddressId(user.addresses[0]._id);
            }
        }
    }, [user]);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type and size
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setStatus({
                type: 'error',
                message: 'Please upload a valid image file (JPEG, PNG, or WebP)'
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setStatus({
                type: 'error',
                message: 'Image size should be less than 5MB'
            });
            return;
        }

        try {
            setIsUploading(true);
            setStatus({ type: '', message: '' });

            const formData = new FormData();
            formData.append('profilePicture', file);

            const response = await axios.put(
                `${API_URL}/users/profile/${user._id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to upload image');
            }

            // Update local user state and localStorage
            setUser(response.data.payload.user);
            localStorage.setItem('user', JSON.stringify(response.data.payload.user));

            setStatus({
                type: 'success',
                message: 'Profile picture updated successfully'
            });
        } catch (err) {
            console.error('Profile picture upload error:', err);
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Failed to upload image'
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddressFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddressSelect = (e) => {
        setSelectedAddressId(e.target.value);
    };

    const handleEditAddress = () => {
        const selectedAddress = user.addresses.find(addr => addr._id === selectedAddressId);
        if (selectedAddress) {
            setAddressFormData({
                street: selectedAddress.street,
                city: selectedAddress.city,
                state: selectedAddress.state,
                postalCode: selectedAddress.postalCode,
                isDefault: selectedAddress.isDefault
            });
            setShowAddressForm(true);
        }
    };

    const handleAddNewAddress = () => {
        setAddressFormData({
            street: '',
            city: '',
            state: '',
            postalCode: '',
            isDefault: false
        });
        setSelectedAddressId(''); // Clear selected address when adding new
        setShowAddressForm(true);
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: '', message: '' });

        try {
            let updatedUser;
            if (showAddressForm) {
                if (selectedAddressId) {
                    // Update existing address
                    updatedUser = await userService.updateAddress(user._id, selectedAddressId, addressFormData);
                } else {
                    // Add new address
                    updatedUser = await userService.addAddress(user._id, addressFormData);
                    
                    // If this is the first address or isDefault is true, update UI accordingly
                    if (!user.addresses?.length || addressFormData.isDefault) {
                        const newAddress = updatedUser.addresses[updatedUser.addresses.length - 1];
                        setSelectedAddressId(newAddress._id);
                    }
                }
                setShowAddressForm(false);
            } else if (selectedAddressId) {
                // Just updating default status
                const selectedAddress = user.addresses.find(addr => addr._id === selectedAddressId);
                if (selectedAddress) {
                    updatedUser = await userService.updateAddress(user._id, selectedAddressId, {
                        ...selectedAddress,
                        isDefault: true
                    });
                }
            }

            if (updatedUser) {
                setStatus({
                    type: 'success',
                    message: selectedAddressId ? 'Address updated successfully' : 'New address added successfully'
                });
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // If no address was previously selected, select the newly added one
                if (!selectedAddressId && updatedUser.addresses?.length > 0) {
                    const newAddress = updatedUser.addresses[updatedUser.addresses.length - 1];
                    setSelectedAddressId(newAddress._id);
                }
            }
        } catch (error) {
            console.error('Address update error:', error);
            setStatus({
                type: 'error',
                message: error.message || 'Failed to update address'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isEditing) {
            setIsEditing(true);
            return;
        }

        setIsLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const updatedUser = await userService.updateProfile(user._id, {
                name: formData.name,
                phone: formData.phone
            });

            setStatus({
                type: 'success',
                message: 'Profile updated successfully'
            });
            setIsEditing(false);
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Profile update error:', error);
            setStatus({
                type: 'error',
                message: error.message || 'Failed to update profile'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatAddress = (address) => {
        const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`;
        return address.isDefault ? `${fullAddress} (Default)` : fullAddress;
    };

    if (isLoading || !formData) {
        return (
            <div className="dashboard-card">
                <h2>Profile Information</h2>
                <div className="loading-spinner">Loading profile data...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-card">
            <h2>Profile Information</h2>

            {status.message && (
                <Error
                    type={status.type}
                    message={status.message}
                    className="mb-4"
                />
            )}

            <div className="profile-content">
                <div className="profile-header">
                    <div className="profile-image-container">
                        <div className="profile-image-wrapper" onClick={handleImageClick}>
                            {user.profilePicture ? (
                                <Image
                                    src={getImageUrl(user.profilePicture)}
                                    alt={user.name}
                                    width={120}
                                    height={120}
                                    className="profile-image"
                                    priority={true}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div className="default-avatar">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="image-overlay">
                                <FiCamera className="camera-icon" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                        {isUploading && <div className="upload-status">Uploading...</div>}
                    </div>
                    <div className="profile-info">
                        <h3>{user.name}</h3>
                        <p>{user.email}</p>
                    </div>
                </div>

                <form className="profile-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <div className="phone-input-group">
                            <span className="country-code">+880</span>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                required
                                maxLength="10"
                                placeholder="1234567890"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Delivery Address</label>
                        <div className="address-selection">
                            <select
                                value={selectedAddressId}
                                onChange={handleAddressSelect}
                                className="address-dropdown"
                                disabled={!user.addresses?.length}
                                title={user.addresses?.find(addr => addr._id === selectedAddressId) ? 
                                    formatAddress(user.addresses.find(addr => addr._id === selectedAddressId)) : 
                                    "No addresses added"}
                            >
                                {user.addresses?.length ? (
                                    user.addresses.map(address => (
                                        <option 
                                            key={address._id} 
                                            value={address._id}
                                            title={formatAddress(address)}
                                        >
                                            {formatAddress(address)}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">No addresses added</option>
                                )}
                            </select>
                            <button
                                type="button"
                                onClick={handleEditAddress}
                                className="icon-button"
                                title="Edit selected address"
                                disabled={!selectedAddressId}
                            >
                                <FiEdit2 />
                            </button>
                            <button
                                type="button"
                                onClick={handleAddNewAddress}
                                className="icon-button"
                                title="Add new address"
                            >
                                <FiPlus />
                            </button>
                        </div>
                    </div>

                    {showAddressForm && (
                        <div className="address-form">
                            <h3>{selectedAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                            <div className="form-group">
                                <label htmlFor="street">Street Address</label>
                                <input
                                    type="text"
                                    id="street"
                                    name="street"
                                    value={addressFormData.street}
                                    onChange={handleAddressChange}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="city">City</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={addressFormData.city}
                                        onChange={handleAddressChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="state">State</label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state"
                                        value={addressFormData.state}
                                        onChange={handleAddressChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="postalCode">Postal Code</label>
                                    <input
                                        type="text"
                                        id="postalCode"
                                        name="postalCode"
                                        value={addressFormData.postalCode}
                                        onChange={handleAddressChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isDefault"
                                        checked={addressFormData.isDefault}
                                        onChange={(e) => setAddressFormData(prev => ({
                                            ...prev,
                                            isDefault: e.target.checked
                                        }))}
                                    />
                                    Set as default address
                                </label>
                            </div>
                            <div className="address-button-group">
                                <button type="button" onClick={handleAddressSubmit} className="btn-primary">
                                    {selectedAddressId ? 'Update Address' : 'Add Address'}
                                </button>
                                <button type="button" onClick={() => setShowAddressForm(false)} className="btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="button-group">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
                        </button>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        name: user.name || '',
                                        phone: user.phone || '',
                                    });
                                }}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
} 