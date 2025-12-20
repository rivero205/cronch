import React from 'react';
import { ChevronRight } from 'lucide-react';

const ReportCard = ({ title, icon: Icon, onClick, description }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white p-6 rounded-xl shadow-sm border border-brand-cream hover:shadow-md hover:border-brand-orange transition-all cursor-pointer group flex flex-col items-center text-center h-full"
        >
            <div className="bg-brand-base p-4 rounded-full mb-4 group-hover:bg-brand-orange/10 transition-colors">
                <Icon size={32} className="text-brand-orange" />
            </div>
            <h3 className="text-lg font-bold text-brand-coffee mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-brand-gray mb-4 flex-grow">{description}</p>
            )}
            <div className="text-brand-gold text-sm font-medium flex items-center mt-auto">
                Ver detalle <ChevronRight size={16} className="ml-1" />
            </div>
        </div>
    );
};

export default ReportCard;
