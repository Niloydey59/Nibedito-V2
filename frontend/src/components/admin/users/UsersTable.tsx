'use client';

import { FiEdit2, FiTrash2, FiUserX, FiUserCheck } from 'react-icons/fi';

export default function UsersTable({ 
    users, 
    pagination, 
    setPagination, 
    onBanUser, 
    onUnbanUser, 
    onDeleteUser 
}) {
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="users-table-container">
            <table className="users-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>
                                {user.email}
                                {user.verificationStatus?.email && 
                                    <span className="verified-badge">✓</span>
                                }
                            </td>
                            <td>
                                {user.phone}
                                {user.verificationStatus?.phone && 
                                    <span className="verified-badge">✓</span>
                                }
                            </td>
                            <td>
                                <span className={`status-badge ${user.isBanned ? 'banned' : 'active'}`}>
                                    {user.isBanned ? 'Banned' : 'Active'}
                                </span>
                            </td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td className="actions">
                                {user.isBanned ? (
                                    <button 
                                        onClick={() => onUnbanUser(user._id)}
                                        className="action-btn unban"
                                        title="Unban User"
                                    >
                                        <FiUserCheck />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => onBanUser(user._id)}
                                        className="action-btn ban"
                                        title="Ban User"
                                    >
                                        <FiUserX />
                                    </button>
                                )}
                                <button 
                                    onClick={() => onDeleteUser(user._id)}
                                    className="action-btn delete"
                                    title="Delete User"
                                >
                                    <FiTrash2 />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                <button 
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="btn-pagination"
                >
                    Previous
                </button>
                <div className="pagination-pages">
                    {Array.from({ length: pagination.pages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => handlePageChange(i + 1)}
                            className={`page-number ${pagination.page === i + 1 ? 'active' : ''}`}
                        >
                            {i + 1}
                        </button>
                    )).slice(
                        Math.max(0, pagination.page - 3),
                        Math.min(pagination.pages, pagination.page + 2)
                    )}
                </div>
                <span className="pagination-info">
                    Page {pagination.page} of {pagination.pages || 1}
                </span>
                <button 
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="btn-pagination"
                >
                    Next
                </button>
            </div>
        </div>
    );
} 