import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { UserPlus, Eye, EyeOff, Check, X, Building2, Loader } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { api } from '../api';
import EmailConfirmationModal from '../components/EmailConfirmationModal';

export default function RegisterWithInvitation() {
    const [searchParams] = useSearchParams();
    const invitationToken = searchParams.get('invitation');
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();

    const [businesses, setBusinesses] = useState([]);
    const [invitation, setInvitation] = useState(null);
    const [loadingInvitation, setLoadingInvitation] = useState(!!invitationToken);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        password: '',
        confirmPassword: '',
        position: '',
        businessId: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (invitationToken) {
            validateInvitation();
        } else {
            // Modo normal: cargar negocios
            loadBusinesses();
        }
    }, [invitationToken]);

    const loadBusinesses = async () => {
        try {
            const data = await api.getBusinesses();
            setBusinesses(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load businesses', err);
            setBusinesses([]);
            showError('Error al cargar lista de negocios');
        }
    };

    const validateInvitation = async () => {
        try {
            const { data, error } = await supabase
                .from('invitations')
                .select('*, businesses(name)')
                .eq('token', invitationToken)
                .eq('status', 'pending')
                .single();

            if (error || !data) {
                throw new Error('Invitación no válida o expirada');
            }

            // Verificar si la invitación expiró
            if (new Date(data.expires_at) < new Date()) {
                throw new Error('Esta invitación ha expirado');
            }

            setInvitation(data);
            setFormData(prev => ({
                ...prev,
                email: data.email,
                firstName: data.first_name || '',
                lastName: data.last_name || '',
                phone: data.phone || '',
                position: data.position || ''
            }));
        } catch (err) {
            console.error('Error validating invitation:', err);
            showError(err.message || 'Error al validar invitación');
            setTimeout(() => navigate('/login'), 2000);
        } finally {
            setLoadingInvitation(false);
        }
    };

    // Password validation rules
    const passwordRules = useMemo(() => ({
        minLength: formData.password.length >= 8,
        hasUppercase: /[A-Z]/.test(formData.password),
        hasLowercase: /[a-z]/.test(formData.password),
        hasNumber: /[0-9]/.test(formData.password),
    }), [formData.password]);

    const isPasswordValid = passwordRules.minLength && passwordRules.hasUppercase &&
        passwordRules.hasLowercase && passwordRules.hasNumber;

    const passwordStrength = useMemo(() => {
        const score = Object.values(passwordRules).filter(Boolean).length;
        if (score <= 1) return { label: 'Muy débil', color: 'bg-red-500', width: '20%' };
        if (score === 2) return { label: 'Débil', color: 'bg-orange-500', width: '40%' };
        if (score === 3) return { label: 'Regular', color: 'bg-yellow-500', width: '60%' };
        if (score === 4) return { label: 'Fuerte', color: 'bg-green-400', width: '80%' };
        return { label: 'Muy fuerte', color: 'bg-green-600', width: '100%' };
    }, [passwordRules]);

    const handleChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validations for non-invitation mode
        if (!invitationToken && !formData.businessId) {
            showError('Debes seleccionar un negocio');
            return;
        }

        if (!isPasswordValid) {
            showError('La contraseña no cumple con los requisitos mínimos');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            showError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            const businessId = invitationToken ? invitation.business_id : formData.businessId;
            const fullName = `${formData.firstName} ${formData.lastName}`;

            // Llamar a Edge Function para crear usuario SIN sesión
            const registerResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/register-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    businessId: businessId,
                    position: formData.position,
                    role: invitationToken ? invitation.role : 'manager',
                    invitationToken: invitationToken || undefined
                })
            });

            const registerResult = await registerResponse.json();

            if (!registerResponse.ok) {
                throw new Error(registerResult.error || 'Error al registrar usuario');
            }

            // Si es invitación, redirigir
            if (invitationToken) {
                showSuccess('Cuenta creada exitosamente. Un administrador debe aprobar tu acceso.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                // Modo normal: mostrar modal
                setShowConfirmationModal(true);
            }

        } catch (err) {
            console.error('Registration error:', err);
            showError(err.message || 'Error al crear la cuenta');
        } finally {
            setLoading(false);
        }
    };

    const PasswordRule = ({ valid, text }) => (
        <div className={`flex items-center text-xs ${valid ? 'text-green-600' : 'text-gray-400'}`}>
            {valid ? <Check size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
            {text}
        </div>
    );

    if (loadingInvitation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="animate-spin text-brand-orange mx-auto mb-4" size={48} />
                    <p className="text-gray-600">Validando invitación...</p>
                </div>
            </div>
        );
    }

    const isInvitationMode = !!invitationToken && !!invitation;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-2xl">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-orange rounded-full mb-3">
                        <UserPlus className="text-white" size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-brand-coffee">
                        {isInvitationMode ? 'Bienvenido a Cronch' : 'Cronch'}
                    </h1>
                    {isInvitationMode ? (
                        <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                            <p className="text-sm text-gray-700 flex items-center justify-center gap-2">
                                <Building2 size={16} className="text-brand-orange" />
                                Has sido invitado a <span className="font-semibold">{invitation.businesses.name}</span>
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-600 text-sm mt-1">Únete a tu equipo de trabajo</p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange('firstName')}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                                placeholder="Juan"
                            />
                        </div>
                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange('lastName')}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                                placeholder="Pérez"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Correo Electrónico {!isInvitationMode && '*'}
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={handleChange('email')}
                                required
                                readOnly={isInvitationMode}
                                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange outline-none text-sm ${
                                    isInvitationMode ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
                                }`}
                                placeholder={isInvitationMode ? '' : 'tu@email.com'}
                            />
                        </div>
                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange('phone')}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                                placeholder="300 123 4567"
                            />
                        </div>
                    </div>

                    {/* Business Selection (solo si no es invitación) */}
                    {!isInvitationMode && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Selecciona tu Negocio *
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.businessId}
                                    onChange={handleChange('businessId')}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange outline-none text-sm appearance-none bg-white"
                                >
                                    <option value="">-- Seleccionar Empresa --</option>
                                    {businesses.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                            <div className="mt-2 text-right">
                                <a
                                    href="https://wa.me/573234389020?text=Hola,%20quiero%20registrar%20mi%20negocio%20en%20Cronch"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-brand-orange hover:underline font-medium inline-flex items-center"
                                >
                                    ¿Tu negocio no está aquí? Contáctanos
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Position */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cargo / Posición</label>
                        <input
                            type="text"
                            value={formData.position}
                            onChange={handleChange('position')}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                            placeholder="Ej: Gerente, Vendedor, Contador"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange('password')}
                                    required
                                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange outline-none text-sm"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar *</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleChange('confirmPassword')}
                                    required
                                    className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-brand-orange outline-none text-sm ${
                                        formData.confirmPassword && formData.password !== formData.confirmPassword
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Password Rules & Strength */}
                    {formData.password && (
                        <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-500">Fuerza:</span>
                                <span className={`text-xs font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                    {passwordStrength.label}
                                </span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                                <div
                                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                    style={{ width: passwordStrength.width }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                <PasswordRule valid={passwordRules.minLength} text="Mínimo 8 caracteres" />
                                <PasswordRule valid={passwordRules.hasUppercase} text="Una mayúscula" />
                                <PasswordRule valid={passwordRules.hasLowercase} text="Una minúscula" />
                                <PasswordRule valid={passwordRules.hasNumber} text="Un número" />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !isPasswordValid}
                        className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg shadow-orange-200"
                    >
                        {loading ? 'Creando cuenta...' : (isInvitationMode ? 'Completar Registro' : 'Crear Cuenta')}
                    </button>
                </form>

                <p className="text-center mt-6 text-gray-600 text-sm">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-brand-orange font-semibold hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </div>

            {!isInvitationMode && (
                <EmailConfirmationModal
                    isOpen={showConfirmationModal}
                    email={formData.email}
                    onClose={() => setShowConfirmationModal(false)}
                />
            )}
        </div>
    );
}
