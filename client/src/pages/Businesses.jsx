import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Building2, Calendar, CheckCircle, MapPin, Phone, Mail, Globe, FileText, Users as UsersIcon, Briefcase, Edit2, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const Businesses = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({});
    const { showError, showSuccess } = useToast();
    const { profile: authProfile } = useAuth();

    const isAdmin = authProfile?.role === 'admin';
    const isSuperAdmin = authProfile?.role === 'super_admin';

    const loadData = async () => {
        try {
            const data = await api.getMyProfile();
            setProfile(data);
        } catch (error) {
            console.error('Failed to load profile', error);
            showError('Error al cargar información del negocio');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOpenEditModal = () => {
        setEditData({
            name: profile.business.name || '',
            description: profile.business.description || '',
            industry: profile.business.industry || '',
            tax_id: profile.business.tax_id || '',
            employee_count: profile.business.employee_count || '',
            address: profile.business.address || '',
            city: profile.business.city || '',
            country: profile.business.country || '',
            phone: profile.business.phone || '',
            email: profile.business.email || '',
            website: profile.business.website || ''
        });
        setShowEditModal(true);
    };

    const handleSaveChanges = async () => {
        try {
            await api.updateBusiness(profile.business.id, editData);
            showSuccess('Información del negocio actualizada exitosamente');
            setShowEditModal(false);
            loadData();
        } catch (error) {
            console.error('Failed to update business', error);
            showError('Error al actualizar información del negocio');
        }
    };

    if (loading) return <div className="p-8 text-center text-brand-gray">Cargando...</div>;

    if (!profile || !profile.business) {
        return (
            <div className="p-8 text-center bg-white rounded-lg shadow-sm border border-gray-100">
                <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Sin Negocio Asignado</h3>
                <p className="mt-2 text-gray-500">Tu cuenta no está vinculada a ningún negocio activo.</p>
                <p className="mt-2 text-sm text-gray-400">Por favor contacta al administrador del sistema.</p>
            </div>
        );
    }

    const business = profile.business;

    return (
        <div className="space-y-6">
            {/* Header 'Mi Negocio' removido por solicitud */}

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-brand-coffee">{business.name}</h1>
                            {(isAdmin || isSuperAdmin) && (
                                <button
                                    onClick={handleOpenEditModal}
                                    className="p-2 text-brand-orange hover:bg-orange-50 rounded-lg transition-colors"
                                    title="Editar negocio"
                                >
                                    <Edit2 size={20} />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">
                            <CheckCircle size={16} />
                            <span className="text-sm font-medium">Negocio Activo</span>
                        </div>
                    </div>
                    <div className="h-16 w-16 bg-orange-100 rounded-lg flex items-center justify-center text-brand-orange">
                        <Building2 size={32} />
                    </div>
                </div>

                {business.description && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">{business.description}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información General */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-brand-dark border-b pb-2">Información General</h3>
                        
                        {business.industry && (
                            <div className="flex items-start gap-3">
                                <Briefcase className="text-brand-orange mt-1" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">Industria</p>
                                    <p className="font-medium text-gray-900">{business.industry}</p>
                                </div>
                            </div>
                        )}

                        {business.tax_id && (
                            <div className="flex items-start gap-3">
                                <FileText className="text-brand-orange mt-1" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">RUC/NIT</p>
                                    <p className="font-medium text-gray-900 font-mono">{business.tax_id}</p>
                                </div>
                            </div>
                        )}

                        {business.employee_count && (
                            <div className="flex items-start gap-3">
                                <UsersIcon className="text-brand-orange mt-1" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">Empleados</p>
                                    <p className="font-medium text-gray-900">{business.employee_count}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Información de Contacto */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-brand-dark border-b pb-2">Contacto</h3>
                        
                        {business.address && (
                            <div className="flex items-start gap-3">
                                <MapPin className="text-brand-orange mt-1" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">Dirección</p>
                                    <p className="font-medium text-gray-900">{business.address}</p>
                                    {(business.city || business.country) && (
                                        <p className="text-sm text-gray-600">
                                            {[business.city, business.country].filter(Boolean).join(', ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {business.phone && (
                            <div className="flex items-start gap-3">
                                <Phone className="text-brand-orange mt-1" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">Teléfono</p>
                                    <p className="font-medium text-gray-900">{business.phone}</p>
                                </div>
                            </div>
                        )}

                        {business.email && (
                            <div className="flex items-start gap-3">
                                <Mail className="text-brand-orange mt-1" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900">{business.email}</p>
                                </div>
                            </div>
                        )}

                        {business.website && (
                            <div className="flex items-start gap-3">
                                <Globe className="text-brand-orange mt-1" size={18} />
                                <div>
                                    <p className="text-sm text-gray-500">Sitio Web</p>
                                    <a 
                                        href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-brand-orange hover:underline"
                                    >
                                        {business.website}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Perfil info removida por solicitud */}
            </div>

            {/* Modal de Edición */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-brand-dark">Editar Información del Negocio</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Información General */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Información General</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre del Negocio *
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción
                                        </label>
                                        <textarea
                                            value={editData.description}
                                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Industria
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.industry}
                                                onChange={(e) => setEditData({ ...editData, industry: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                RUC/NIT
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.tax_id}
                                                onChange={(e) => setEditData({ ...editData, tax_id: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Número de Empleados
                                        </label>
                                        <input
                                            type="number"
                                            value={editData.employee_count}
                                            onChange={(e) => setEditData({ ...editData, employee_count: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Información de Contacto */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Información de Contacto</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Dirección
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.address}
                                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ciudad
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.city}
                                                onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                País
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.country}
                                                onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Teléfono
                                            </label>
                                            <input
                                                type="tel"
                                                value={editData.phone}
                                                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={editData.email}
                                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sitio Web
                                        </label>
                                        <input
                                            type="url"
                                            value={editData.website}
                                            onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                className="px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 font-medium"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Businesses;
