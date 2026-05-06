import React, { useEffect } from 'react';
import '../styles/main.css';

function AlertBanner({ message, type, onClose }) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            onClose();
        }, 4000); // auto-hide after 4 seconds
        return () => clearTimeout(timer);
    }, [message, onClose]);

    if (!message) return null;

    return (
        <div className={`alert-banner alert-${type}`}>
            {message}
        </div>
    );
}

export default AlertBanner;