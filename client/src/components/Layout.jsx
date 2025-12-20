import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Factory, DollarSign, User, LogOut, FileText } from 'lucide-react';
import logo from '../assets/logo_compañia.png';

const Layout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/expenses', label: 'Insumos', icon: ShoppingCart },
        { path: '/production', label: 'Producción', icon: Factory },
        { path: '/sales', label: 'Ventas', icon: DollarSign },
        { path: '/reports', label: 'Reportes', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-brand-base flex font-sans text-brand-coffee">
            {/* Sidebar */}
            <aside className="w-64 bg-brand-coffee shadow-lg fixed h-full z-20 hidden md:flex flex-col overflow-y-auto">
                <div className="p-4 flex justify-center items-center border-b border-brand-orange/20">
                    <img src={logo} alt="Crunch Logo" className="object-contain" style={{ width: '150px', height: '150px' }} />
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-brand-orange text-white shadow-md'
                                    : 'text-white hover:bg-brand-orange/20 hover:text-brand-orange'
                                    }`}
                            >
                                <Icon size={20} className={`${isActive ? 'text-white' : 'text-brand-orange'}`} />
                                <span className="ml-3 font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-brand-orange/20">
                    <button className="flex items-center w-full px-4 py-3 text-white hover:text-status-danger transition-colors rounded-xl hover:bg-red-900/30">
                        <LogOut size={20} />
                        <span className="ml-3 font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="bg-white shadow-sm sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-brand-coffee">
                        {navItems.find(i => i.path === location.pathname)?.label || 'Crunch'}
                    </h2>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3 bg-brand-base px-4 py-2 rounded-full">
                            <div className="bg-brand-orange p-1.5 rounded-full text-white">
                                <User size={20} />
                            </div>
                            <span className="font-semibold text-brand-coffee text-sm">Usuario Admin</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-grow p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
