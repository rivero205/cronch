import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Factory, DollarSign, User, LogOut, FileText, Package, Menu, X, AlertTriangle, Building2, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo_compañia.png';
import NotificationBell from './NotificationBell';

// Logout Confirmation Modal
const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-4">
                        <AlertTriangle className="text-red-600" size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        ¿Cerrar sesión?
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                        ¿Estás seguro que deseas cerrar tu sesión? Tendrás que iniciar sesión nuevamente para acceder.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 bg-red-600 rounded-lg text-white font-medium hover:bg-red-700 transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

const Layout = ({ children }) => {
    const location = useLocation();
    const { signOut, getUserDisplayName, hasRole } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const userName = getUserDisplayName();

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open or modal is open
    useEffect(() => {
        if (isMobileMenuOpen || showLogoutModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen, showLogoutModal]);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
        setIsMobileMenuOpen(false);
    };

    const handleLogoutConfirm = async () => {
        setShowLogoutModal(false);
        await signOut();
    };

    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
    };

    // Check if user is super admin
    const isSuperAdmin = hasRole(['super_admin']);

    // Define nav items with required roles - SEPARATED by role type
    const adminNavItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['manager', 'admin'] },
        { path: '/products', label: 'Productos', icon: Package, roles: ['manager', 'admin'] },
        { path: '/expenses', label: 'Insumos', icon: ShoppingCart, roles: ['manager', 'admin'] },
        { path: '/production', label: 'Producción', icon: Factory, roles: ['manager', 'admin'] },
        { path: '/sales', label: 'Ventas', icon: DollarSign, roles: ['manager', 'admin'] },
        { path: '/reports', label: 'Reportes', icon: FileText, roles: ['admin'] },
        { path: '/businesses', label: 'Mi Negocio', icon: Building2, roles: ['admin'] },
        { path: '/users', label: 'Mi Equipo', icon: Users, roles: ['admin'] },
    ];

    const superAdminNavItems = [
        { path: '/', label: 'Dashboard Global', icon: LayoutDashboard, roles: ['super_admin'] },
        { path: '/businesses-admin', label: 'Negocios', icon: Building2, roles: ['super_admin'] },
        { path: '/users', label: 'Usuarios', icon: Users, roles: ['super_admin'] },
        { path: '/reports', label: 'Reportes Globales', icon: FileText, roles: ['super_admin'] },
    ];

    // Use different navigation based on role
    const allNavItems = isSuperAdmin ? superAdminNavItems : adminNavItems;

    // Filter navigation items based on user role
    const navItems = allNavItems.filter(item => hasRole(item.roles));

    const NavLinks = ({ onItemClick }) => (
        <>
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={onItemClick}
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
        </>
    );

    return (
        <>
            {/* Logout Confirmation Modal */}
            <LogoutModal
                isOpen={showLogoutModal}
                onConfirm={handleLogoutConfirm}
                onCancel={handleLogoutCancel}
            />

            <div className="min-h-screen bg-brand-base flex font-sans text-brand-coffee">
                {/* Desktop Sidebar */}
                <aside className="w-64 bg-brand-coffee shadow-lg fixed h-full z-20 hidden md:flex flex-col overflow-y-auto">
                    <div className="p-4 flex justify-center items-center border-b border-brand-orange/20">
                        <img src={logo} alt="Crunch Logo" className="object-contain" style={{ width: '150px', height: '150px' }} />
                    </div>

                    <nav className="flex-1 py-6 px-4 space-y-2">
                        <NavLinks />
                    </nav>

                    <div className="p-4 border-t border-brand-orange/20">
                        <button
                            onClick={handleLogoutClick}
                            className="flex items-center w-full px-4 py-3 text-white hover:text-status-danger transition-colors rounded-xl hover:bg-red-900/30"
                        >
                            <LogOut size={20} />
                            <span className="ml-3 font-medium">Cerrar Sesión</span>
                        </button>
                    </div>
                </aside>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Mobile Sidebar */}
                <aside
                    className={`fixed top-0 left-0 h-full w-72 bg-brand-coffee shadow-xl z-40 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <div className="p-4 flex justify-between items-center border-b border-brand-orange/20">
                        <img src={logo} alt="Crunch Logo" className="object-contain" style={{ width: '80px', height: '80px' }} />
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 text-white hover:text-brand-orange transition-colors rounded-lg"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="flex-1 py-6 px-4 space-y-2">
                        <NavLinks onItemClick={() => setIsMobileMenuOpen(false)} />
                    </nav>

                    <div className="p-4 border-t border-brand-orange/20">
                        <button
                            onClick={handleLogoutClick}
                            className="flex items-center w-full px-4 py-3 text-white hover:text-status-danger transition-colors rounded-xl hover:bg-red-900/30"
                        >
                            <LogOut size={20} />
                            <span className="ml-3 font-medium">Cerrar Sesión</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Wrapper */}
                <div className="flex-1 md:ml-64 flex flex-col min-h-screen overflow-x-hidden">


                    {/* Top Bar */}
                    <header className="bg-white shadow-sm sticky top-0 z-10 px-4 md:px-8 py-4 flex justify-between items-center">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-brand-coffee hover:text-brand-orange transition-colors md:hidden rounded-lg hover:bg-brand-base"
                        >
                            <Menu size={24} />
                        </button>

                        <h2 className="text-lg md:text-xl font-bold text-brand-coffee">
                            {navItems.find(i => i.path === location.pathname)?.label || 'Crunch'}
                        </h2>

                        <div className="flex items-center space-x-2 md:space-x-4">
                            {/* Notification Bell */}
                            <NotificationBell />

                            <Link to="/profile" className="flex items-center space-x-2 md:space-x-3 bg-brand-base px-3 md:px-4 py-2 rounded-full hover:bg-brand-orange/10 transition-colors">
                                <div className="bg-brand-orange p-1.5 rounded-full text-white">
                                    <User size={18} className="md:w-5 md:h-5" />
                                </div>
                                <span className="font-semibold text-brand-coffee text-xs md:text-sm hidden sm:inline max-w-[120px] truncate">
                                    {userName}
                                </span>
                            </Link>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-grow p-4 md:p-8 overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
};

export default Layout;
