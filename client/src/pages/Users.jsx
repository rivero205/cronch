import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Users as UsersIcon, UserPlus, Mail, Phone, Shield, Edit2, Building2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { createPortal } from 'react-dom';
import ConfirmModal from '../components/ConfirmModal';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'pending'

    // Modals state
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [userToApprove, setUserToApprove] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [userToToggleStatus, setUserToToggleStatus] = useState(null);

    const { showError, showSuccess } = useToast();
    const { profile } = useAuth();

    const isAdmin = profile?.role === 'admin';
    const isSuperAdmin = profile?.role === 'super_admin';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Cargar usuarios activos (solo status = 'active')
            const { data: activeUsersData, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, phone, position, role, status, is_active, created_at')
                .eq('business_id', profile.business_id)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(activeUsersData || []);

            // Si es admin, cargar usuarios pendientes
            if (isAdmin || isSuperAdmin) {
                await loadPendingUsers();
            }
        } catch (error) {
            console.error('Failed to load users', error);
            showError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const loadPendingUsers = async () => {
        try {
            // Obtener usuarios pendientes incluyendo email
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    id,
                    first_name,
                    last_name,
                    email,
                    phone,
                    position,
                    role,
                    status,
                    created_at
                `)
                .eq('business_id', profile.business_id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setPendingUsers(data || []);
        } catch (error) {
            console.error('Error loading pending users:', error);
        }
    };

    const handleApproveClick = (user) => {
        setUserToApprove(user);
        setShowApproveModal(true);
    };

    const handleApproveConfirm = async () => {
        if (!userToApprove) return;
        const userId = userToApprove.id;

        try {
            const { data: { session } } = await supabase.auth.getSession();

            console.log('🔑 Sesión actual:', session ? 'Activa' : 'No existe');

            if (!session) {
                throw new Error('No hay sesión activa. Por favor, vuelve a iniciar sesión.');
            }

            console.log('📤 Enviando petición de aprobación para usuario:', userId);

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/approve-user`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({ userId })
                }
            );

            console.log('📥 Respuesta recibida:', response.status, response.statusText);

            const result = await response.json();

            console.log('📋 Resultado:', result);

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Error al aprobar usuario');
            }

            showSuccess('Usuario aprobado exitosamente. Se ha enviado email de confirmación.');
            loadData();
        } catch (error) {
            console.error('❌ Failed to approve user:', error);
            showError(error.message || 'Error al aprobar usuario');
        } finally {
            setUserToApprove(null);
        }
    };

    const handleRejectUser = async (userId) => {
        const reason = prompt('¿Por qué rechazas este usuario? (Opcional)');
        if (reason === null) return; // Usuario canceló

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reject-user`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ userId, reason })
                }
            );

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Error al rechazar usuario');
            }

            showSuccess('Usuario rechazado y eliminado exitosamente.');
            loadData();
        } catch (error) {
            console.error('Failed to reject user', error);
            showError(error.message || 'Error al rechazar usuario');
        }
    };

    const handleChangeRole = async (userId, role) => {
        setSelectedUser(userId);
        setNewRole(role);
        setShowRoleModal(true);
    };

    const confirmRoleChange = async () => {
        try {
            await api.updateUserRole(selectedUser, newRole);
            showSuccess('Rol actualizado exitosamente');
            setShowRoleModal(false);
            loadData();
        } catch (error) {
            console.error('Failed to update role', error);
            showError('Error al actualizar rol');
        }
    };

    const handleToggleStatusClick = (user) => {
        setUserToToggleStatus(user);
        setShowStatusModal(true);
    };

    const handleToggleStatusConfirm = async () => {
        if (!userToToggleStatus) return;

        try {
            await api.updateUserStatus(userToToggleStatus.id, !userToToggleStatus.is_active);
            showSuccess(`Usuario ${userToToggleStatus.is_active ? 'desactivado' : 'activado'} exitosamente`);
            loadData();
        } catch (error) {
            console.error('Failed to update status', error);
            showError('Error al actualizar estado');
        } finally {
            setUserToToggleStatus(null);
        }
    };

    const getRoleBadgeColor = (role) => {
        if (role === 'super_admin') return 'bg-red-100 text-red-700';
        if (role === 'admin') return 'bg-purple-100 text-purple-700';
        if (role === 'editor') return 'bg-blue-100 text-blue-700';
        return 'bg-gray-100 text-gray-700';
    };

    const getRoleLabel = (role) => {
        if (role === 'super_admin') return 'Super Admin';
        if (role === 'admin') return 'Admin';
        if (role === 'editor') return 'Editor';
        if (role === 'manager') return 'Manager';
        return 'Viewer';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                    <UsersIcon className="text-brand-orange" />
                    {isSuperAdmin ? 'Usuarios del Sistema' : 'Equipo de Trabajo'}
                </h2>
                <button
                    disabled
                    className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 cursor-not-allowed"
                    title="Próximamente"
                >
                    <UserPlus size={18} />
                    Invitar Usuario
                </button>
            </div>

            {/* Tabs */}
            {(isAdmin || isSuperAdmin) && (
                <div className="flex gap-2 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'active'
                            ? 'border-brand-orange text-brand-orange'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Activos ({users.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pending'
                            ? 'border-yellow-500 text-yellow-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Clock size={16} />
                        Pendientes ({pendingUsers.length})
                    </button>
                </div>
            )}

            {/* Tabla de Usuarios Activos */}
            {activeTab === 'active' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                    {loading ? (
                        <div className="p-8 text-center text-brand-gray">Cargando usuarios...</div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-brand-gray">No hay usuarios registrados.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 border-b">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Nombre</th>
                                        {isSuperAdmin && <th className="px-6 py-3 font-medium">Negocio</th>}
                                        <th className="px-6 py-3 font-medium">Contacto</th>
                                        <th className="px-6 py-3 font-medium">Cargo</th>
                                        <th className="px-6 py-3 font-medium">Rol</th>
                                        <th className="px-6 py-3 font-medium">Estado</th>
                                        {(isSuperAdmin || isAdmin) && <th className="px-6 py-3 font-medium">Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3">
                                                <div className="font-medium text-brand-dark">
                                                    {user.first_name} {user.last_name}
                                                </div>
                                            </td>
                                            {isSuperAdmin && (
                                                <td className="px-6 py-3">
                                                    {user.business ? (
                                                        <span className="flex items-center gap-1 text-gray-700">
                                                            <Building2 size={14} className="text-brand-orange" />
                                                            {user.business.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">Sin asignar</span>
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col gap-1 text-xs text-gray-500">
                                                    {user.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone size={12} /> {user.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-gray-600">{user.position || '-'}</td>
                                            <td className="px-6 py-3">
                                                {(isSuperAdmin || isAdmin) ? (
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                                        disabled={user.role === 'super_admin' || user.role === 'admin'}
                                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'super_admin' || user.role === 'admin'
                                                            ? 'cursor-not-allowed opacity-60'
                                                            : 'cursor-pointer'
                                                            } ${getRoleBadgeColor(user.role)}`}
                                                    >
                                                        <option value="manager">Manager</option>
                                                        <option value="editor">Editor</option>
                                                        <option value="admin">Admin</option>
                                                        {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                                                    </select>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                        <Shield size={10} />
                                                        {getRoleLabel(user.role)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold
                                                    ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {user.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            {(isSuperAdmin || isAdmin) && (
                                                <td className="px-6 py-3">
                                                    <button
                                                        onClick={() => handleToggleStatusClick(user)}
                                                        className={`text-xs px-2 py-1 rounded ${user.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                    >
                                                        {user.is_active ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Tabla de Usuarios Pendientes */}
            {activeTab === 'pending' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-yellow-200">
                    {loading ? (
                        <div className="p-8 text-center text-brand-gray">Cargando usuarios pendientes...</div>
                    ) : pendingUsers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Clock size={48} className="mx-auto mb-3 text-gray-300" />
                            <p>No hay usuarios pendientes de aprobación</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-yellow-50 text-gray-600 border-b border-yellow-200">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Nombre</th>
                                        <th className="px-6 py-3 font-medium">Email</th>
                                        <th className="px-6 py-3 font-medium">Teléfono</th>
                                        <th className="px-6 py-3 font-medium">Cargo</th>
                                        <th className="px-6 py-3 font-medium">Fecha Registro</th>
                                        <th className="px-6 py-3 font-medium text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-yellow-50/50">
                                            <td className="px-6 py-3">
                                                <div className="font-medium text-brand-dark">
                                                    {user.first_name} {user.last_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="flex items-center gap-1 text-gray-600 text-xs">
                                                    <Mail size={12} />
                                                    {user.email}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-gray-600 text-xs">
                                                {user.phone || '-'}
                                            </td>
                                            <td className="px-6 py-3 text-gray-600 text-xs">
                                                {user.position || '-'}
                                            </td>
                                            <td className="px-6 py-3 text-gray-500 text-xs">
                                                {new Date(user.created_at).toLocaleDateString('es-ES')}
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleApproveClick(user)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-medium transition-colors"
                                                        title="Aprobar usuario"
                                                    >
                                                        <CheckCircle size={14} />
                                                        Aprobar
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectUser(user.id)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors"
                                                        title="Rechazar usuario"
                                                    >
                                                        <XCircle size={14} />
                                                        Rechazar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de confirmación de cambio de rol */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-brand-dark mb-4">Confirmar Cambio de Rol</h3>
                        <p className="text-gray-600 mb-6">
                            ¿Estás seguro de que deseas cambiar el rol a <strong>{getRoleLabel(newRole)}</strong>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRoleModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmRoleChange}
                                className="flex-1 px-4 py-2 bg-brand-orange rounded-lg text-white hover:bg-orange-600"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve User Confirmation Modal */}
            <ConfirmModal
                isOpen={showApproveModal}
                onClose={() => {
                    setShowApproveModal(false);
                    setUserToApprove(null);
                }}
                onConfirm={handleApproveConfirm}
                title="Aprobar Usuario"
                message={`¿Estás seguro de aprobar a ${userToApprove?.first_name} ${userToApprove?.last_name}? Se le enviará un email de confirmación.`}
                confirmText="Aprobar"
                cancelText="Cancelar"
                variant="info"
            />

            {/* Toggle Status Confirmation Modal */}
            <ConfirmModal
                isOpen={showStatusModal}
                onClose={() => {
                    setShowStatusModal(false);
                    setUserToToggleStatus(null);
                }}
                onConfirm={handleToggleStatusConfirm}
                title={userToToggleStatus?.is_active ? 'Desactivar Usuario' : 'Activar Usuario'}
                message={`¿Estás seguro de que deseas ${userToToggleStatus?.is_active ? 'desactivar' : 'activar'} el acceso para ${userToToggleStatus?.first_name} ${userToToggleStatus?.last_name}?`}
                confirmText={userToToggleStatus?.is_active ? 'Desactivar' : 'Activar'}
                cancelText="Cancelar"
                variant={userToToggleStatus?.is_active ? 'warning' : 'info'}
            />
        </div>
    );
};

export default Users;

