import React from 'react';

const StatCard = ({ title, value, subtext, type = 'default' }) => {
    const typeStyles = {
        default: 'border-l-4 border-brand-gray',
        success: 'border-l-4 border-status-success',
        warning: 'border-l-4 border-brand-gold',
        danger: 'border-l-4 border-status-danger',
    };

    return (
        <div className={`bg-white p-4 rounded-lg shadow-sm ${typeStyles[type]}`}>
            <h3 className="text-sm font-medium text-brand-gray uppercase tracking-wider">{title}</h3>
            <div className="mt-2 flex items-baseline">
                <span className="text-2xl font-bold text-brand-dark">{value}</span>
            </div>
            {subtext && <p className="mt-1 text-xs text-brand-gray">{subtext}</p>}
        </div>
    );
};

export default StatCard;
