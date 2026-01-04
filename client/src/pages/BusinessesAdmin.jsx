import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Building2, Plus, Edit2, Trash2, CheckCircle, XCircle, MapPin, Phone, Briefcase, UserPlus, Mail } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabaseClient';
import ConfirmModal from '../components/ConfirmModal';

const BusinessesAdmin = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [editingBusiness, setEditingBusiness] = useState(null);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [businessToDeactivate, setBusinessToDeactivate] = useState(null);
    const { showSuccess, showError } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        city: '',
        country: 'Colombia',
        phone: '',
        email: '',
        website: '',
        tax_id: '',
        industry: '',
        employee_count: ''
    });

    const [inviteFormData, setInviteFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        position: '',
        role: 'manager'
    });

    useEffect(() => {
        loadBusinesses();
    }, []);

    const loadBusinesses = async () => {
        try {
            const data = await api.getAllBusinesses();
            setBusinesses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load businesses', error);
            showError('Error al cargar negocios');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (business = null) => {
        if (business) {
            setEditingBusiness(business);
            setFormData({
                name: business.name || '',
                description: business.description || '',
                address: business.address || '',
                city: business.city || '',
                country: business.country || 'Colombia',
                phone: business.phone || '',
                email: business.email || '',
                website: business.website || '',
                tax_id: business.tax_id || '',
                industry: business.industry || '',
                employee_count: business.employee_count || ''
            });
        } else {
            setEditingBusiness(null);
            setFormData({
                name: '',
                description: '',
                address: '',
                city: '',
                country: 'Colombia',
                phone: '',
                email: '',
                website: '',
                tax_id: '',
                industry: '',
                employee_count: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingBusiness(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBusiness) {
                await api.updateBusiness(editingBusiness.id, formData);
                showSuccess('Negocio actualizado exitosamente');
            } else {
                await api.createBusiness(formData);
                showSuccess('Negocio creado exitosamente');
            }
            handleCloseModal();
            loadBusinesses();
        } catch (error) {
            console.error('Failed to save business', error);
            showError(error.message || 'Error al guardar negocio');
        }
    };

    const handleDeactivateClick = (businessId) => {
        // Find business object for the modal message
        const business = businesses.find(b => b.id === businessId);
        setBusinessToDeactivate(business);
        setShowDeactivateModal(true);
    };

    const handleDeactivateConfirm = async () => {
        if (!businessToDeactivate) return;

        try {
            await api.deactivateBusiness(businessToDeactivate.id);
            showSuccess('Negocio desactivado');
            loadBusinesses();
        } catch (error) {
            console.error('Failed to deactivate business', error);
            showError('Error al desactivar negocio');
        } finally {
            setBusinessToDeactivate(null);
        }
    };

    const handleOpenInviteModal = (business) => {
        setSelectedBusiness(business);
        setInviteFormData({
            email: '',
            firstName: '',
            lastName: '',
            phone: '',
            position: '',
            role: 'manager'
        });
        setShowInviteModal(true);
    };

    const handleCloseInviteModal = () => {
        setShowInviteModal(false);
        setSelectedBusiness(null);
    };

    const handleInviteSubmit = async (e) => {
        e.preventDefault();

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw new Error('No hay sesión activa');
            }

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    businessId: selectedBusiness.id,
                    email: inviteFormData.email,
                    firstName: inviteFormData.firstName || undefined,
                    lastName: inviteFormData.lastName || undefined,
                    phone: inviteFormData.phone || undefined,
                    position: inviteFormData.position || undefined,
                    role: inviteFormData.role
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al enviar invitación');
            }

            showSuccess('Invitación enviada exitosamente');
            handleCloseInviteModal();
        } catch (error) {
            console.error('Failed to send invitation', error);
            showError(error.message || 'Error al enviar invitación');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                    <Building2 className="text-brand-orange" />
                    Gestión de Negocios
                </h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-brand-orange text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-orange-600 transition-colors"
                >
                    <Plus size={18} />
                    Crear Negocio
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                {loading ? (
                    <div className="p-8 text-center text-brand-gray">Cargando negocios...</div>
                ) : businesses.length === 0 ? (
                    <div className="p-8 text-center text-brand-gray">No hay negocios registrados.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 border-b">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Negocio</th>
                                    <th className="px-6 py-3 font-medium">Industria</th>
                                    <th className="px-6 py-3 font-medium">Ubicación</th>
                                    <th className="px-6 py-3 font-medium">Contacto</th>
                                    <th className="px-6 py-3 font-medium">Estado</th>
                                    <th className="px-6 py-3 font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {businesses.map((business) => (
                                    <tr key={business.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center text-brand-orange">
                                                    <Building2 size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-brand-dark">{business.name}</div>
                                                    {business.tax_id && (
                                                        <div className="text-xs text-gray-500 font-mono">{business.tax_id}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {business.industry ? (
                                                <span className="flex items-center gap-1 text-gray-700">
                                                    <Briefcase size={14} className="text-gray-400" />
                                                    {business.industry}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {business.city || business.country ? (
                                                <span className="flex items-center gap-1 text-gray-700">
                                                    <MapPin size={14} className="text-gray-400" />
                                                    {[business.city, business.country].filter(Boolean).join(', ')}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-xs text-gray-600">
                                                {business.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone size={12} /> {business.phone}
                                                    </span>
                                                )}
                                                {business.email && (
                                                    <span className="truncate max-w-[150px]">{business.email}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                ${business.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {business.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                {business.status === 'active' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenInviteModal(business)}
                                                    className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                                                    title="Invitar Usuario"
                                                >
                                                    <UserPlus size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(business)}
                                                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {business.status === 'active' && (
                                                    <button
                                                        onClick={() => handleDeactivateClick(business.id)}
                                                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                                        title="Desactivar"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal para Crear/Editar Negocio */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 my-8">
                        <h3 className="text-xl font-bold text-brand-dark mb-6">
                            {editingBusiness ? 'Editar Negocio' : 'Crear Nuevo Negocio'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre del Negocio <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Industria</label>
                                    <input
                                        type="text"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        placeholder="Ej: Panadería, Restaurante"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">RUC/NIT</label>
                                    <input
                                        type="text"
                                        value={formData.tax_id}
                                        onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sitio Web</label>
                                    <input
                                        type="text"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="www.ejemplo.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Empleados</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.employee_count}
                                        onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-brand-orange rounded-lg text-white font-medium hover:bg-orange-600 transition-colors"
                                >
                                    {editingBusiness ? 'Actualizar' : 'Crear Negocio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Invitar Usuario */}
            {showInviteModal && selectedBusiness && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <UserPlus className="text-green-600" size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-brand-dark">Invitar Usuario</h3>
                                <p className="text-sm text-gray-500">{selectedBusiness.name}</p>
                            </div>
                        </div>

                        <form onSubmit={handleInviteSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={inviteFormData.email}
                                        onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                                        placeholder="usuario@ejemplo.com"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={inviteFormData.firstName}
                                        onChange={(e) => setInviteFormData({ ...inviteFormData, firstName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                                    <input
                                        type="text"
                                        value={inviteFormData.lastName}
                                        onChange={(e) => setInviteFormData({ ...inviteFormData, lastName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    value={inviteFormData.phone}
                                    onChange={(e) => setInviteFormData({ ...inviteFormData, phone: e.target.value })}
                                    placeholder="300 123 4567"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo/Posición</label>
                                <input
                                    type="text"
                                    value={inviteFormData.position}
                                    onChange={(e) => setInviteFormData({ ...inviteFormData, position: e.target.value })}
                                    placeholder="Ej: Gerente, Vendedor"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                <select
                                    value={inviteFormData.role}
                                    onChange={(e) => setInviteFormData({ ...inviteFormData, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                >
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    El usuario recibirá un email con el link para completar su registro
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseInviteModal}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-brand-orange rounded-lg text-white font-medium hover:bg-orange-600 transition-colors"
                                >
                                    Enviar Invitación
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Deactivate Business Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeactivateModal}
                onClose={() => {
                    setShowDeactivateModal(false);
                    setBusinessToDeactivate(null);
                }}
                onConfirm={handleDeactivateConfirm}
                title="Desactivar Negocio"
                message={`¿Estás seguro de que deseas desactivar el negocio "${businessToDeactivate?.name}"? Esta acción deshabilitará el acceso a todos sus usuarios.`}
                confirmText="Desactivar"
                cancelText="Cancelar"
                variant="warning"
            />
        </div>
    );
};

export default BusinessesAdmin;
