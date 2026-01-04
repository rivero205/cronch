import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Building2, Mail, Calendar, Shield, Phone, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabaseClient';

const Profile = () => {
    const { user, profile } = useAuth();
    const [businessData, setBusinessData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBusinessData();
    }, [profile]);

    const loadBusinessData = async () => {
        if (!profile?.business_id) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('businesses')
                .select('name, created_at')
                .eq('id', profile.business_id)
                .single();

            if (error) throw error;
            setBusinessData(data);
        } catch (error) {
            console.error('Error loading business:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user || !profile) return null;

    const fullName = profile.first_name && profile.last_name 
        ? `${profile.first_name} ${profile.last_name}` 
        : 'Usuario';
    const businessName = businessData?.name || 'No registrado';
    const email = user.email;
    const joinDate = profile.created_at ? new Date(profile.created_at) : new Date();
    
    const getRoleLabel = (role) => {
        if (role === 'super_admin') return 'Super Administrador';
        if (role === 'admin') return 'Administrador';
        if (role === 'editor') return 'Editor';
        return 'Manager';
    };

    const getRoleBadgeColor = (role) => {
        if (role === 'super_admin') return 'bg-red-50 text-red-700 border-red-100';
        if (role === 'admin') return 'bg-purple-50 text-purple-700 border-purple-100';
        if (role === 'editor') return 'bg-blue-50 text-blue-700 border-blue-100';
        return 'bg-green-50 text-green-700 border-green-100';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-brand-dark flex items-center">
                <User className="mr-3 text-brand-orange" size={28} />
                Mi Perfil
            </h2>

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col md:flex-row items-center md:items-start gap-8 border border-gray-100">
                <div className="relative">
                    <div className="w-32 h-32 bg-brand-orange/10 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                        <User size={64} className="text-brand-orange" />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm" title="Cuenta Activa">
                        <Shield size={14} className="text-white" />
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <h3 className="text-3xl font-bold text-brand-dark">{fullName}</h3>
                    <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2">
                        <Building2 size={18} />
                        {businessName}
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-4">
                        <span className="bg-brand-gold/10 text-brand-coffee px-3 py-1 rounded-full text-sm font-medium border border-brand-gold/20">
                            Plan Gratuito
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(profile.role)}`}>
                            {getRoleLabel(profile.role)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h4 className="text-lg font-bold text-brand-dark mb-6 flex items-center border-b pb-2">
                        <Shield className="mr-2 text-brand-gold" size={20} />
                        Información de Cuenta
                    </h4>

                    <div className="space-y-6">
                        <div className="group">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Correo Electrónico</label>
                            <div className="flex items-center text-gray-700 bg-gray-50/50 p-2 rounded-lg group-hover:bg-gray-50 transition-colors">
                                <Mail className="mr-3 text-gray-400" size={18} />
                                {email}
                            </div>
                        </div>

                        <div className="group">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Fecha de Registro</label>
                            <div className="flex items-center text-gray-700 bg-gray-50/50 p-2 rounded-lg group-hover:bg-gray-50 transition-colors">
                                <Calendar className="mr-3 text-gray-400" size={18} />
                                {format(joinDate, "d 'de' MMMM, yyyy", { locale: es })}
                            </div>
                        </div>

                        {profile.phone && (
                            <div className="group">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Teléfono</label>
                                <div className="flex items-center text-gray-700 bg-gray-50/50 p-2 rounded-lg group-hover:bg-gray-50 transition-colors">
                                    <Phone className="mr-3 text-gray-400" size={18} />
                                    {profile.phone}
                                </div>
                            </div>
                        )}

                        {profile.position && (
                            <div className="group">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Cargo</label>
                                <div className="flex items-center text-gray-700 bg-gray-50/50 p-2 rounded-lg group-hover:bg-gray-50 transition-colors">
                                    <Briefcase className="mr-3 text-gray-400" size={18} />
                                    {profile.position}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Account Settings (Placeholder for now) */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h4 className="text-lg font-bold text-brand-dark mb-6 flex items-center border-b pb-2">
                        <Building2 className="mr-2 text-brand-gold" size={20} />
                        Detalles del Negocio
                    </h4>

                    <div className="space-y-6">
                        <div className="group">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Nombre del Negocio</label>
                            <div className="flex items-center text-gray-700 font-medium bg-gray-50/50 p-2 rounded-lg">
                                {businessName}
                            </div>
                        </div>

                        <div className="p-4 bg-brand-base rounded-lg border border-brand-orange/10">
                            <p className="text-sm text-brand-coffee">
                                Para modificar los detalles de tu negocio o información personal, por favor contacta a soporte técnico o espera a próximas actualizaciones.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
