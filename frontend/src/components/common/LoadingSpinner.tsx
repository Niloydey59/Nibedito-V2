'use client';

export default function LoadingSpinner({ size = 'normal', fullPage = true }) {
    const spinnerClass = size === 'small' ? 'loading-spinner small' : 'loading-spinner';
    
    if (fullPage) {
        return (
            <div className="loading-spinner-container">
                <div className={spinnerClass}></div>
            </div>
        );
    }
    
    return <div className={spinnerClass}></div>;
} 