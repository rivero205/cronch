import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { api } from '../api';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                ensureProfileExists(session.user);
                loadUserProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                ensureProfileExists(session.user);
                loadUserProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load user profile with role information and status
    const loadUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, business_id, first_name, last_name, role, status, is_active, position, phone')
                .eq('id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error loading profile:', error);
            } else if (data) {
                setProfile(data);
                
                // CRÍTICO: Si el usuario no está activo, hacer logout automático
                if (data.status !== 'active' || !data.is_active) {
                    console.log('Usuario no está activo, cerrando sesión');
                    await supabase.auth.signOut();
                    setProfile(null);
                }
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to create profile if it doesn't exist (for email-confirmed users)
    const ensureProfileExists = async (authUser) => {
        try {
            // Check if profile exists
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', authUser.id)
                .single();

            if (!existingProfile) {
                // Profile doesn't exist, create it from metadata
                const meta = authUser.user_metadata;
                if (meta && meta.business_id) {
                    console.log('Creating profile from metadata...');
                    const { error } = await supabase
                        .from('profiles')
                        .insert({
                            id: authUser.id,
                            business_id: meta.business_id,
                            first_name: meta.first_name,
                            last_name: meta.last_name,
                            phone: meta.phone || null,
                            position: meta.position || null,
                            email: authUser.email,
                            role: 'manager',
                            status: 'pending',
                            is_active: false
                        });

                    if (error) {
                        console.error('Error creating profile:', error);
                    } else {
                        console.log('Profile created successfully from metadata');
                    }
                }
            }
        } catch (error) {
            console.error('Error checking/creating profile:', error);
        }
    };

    const signUp = async (email, password, metadata = {}) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: undefined, // No redirigir automáticamente
                data: {
                    full_name: metadata.full_name || metadata.fullName || '',
                    business_name: metadata.business_name || metadata.businessName || '',
                    // Store fields for profile creation via trigger
                    first_name: metadata.first_name,
                    last_name: metadata.last_name,
                    phone: metadata.phone,
                    position: metadata.position,
                    business_id: metadata.business_id,
                    role: metadata.role || 'manager',
                    invitation_id: metadata.invitation_id // Si viene de invitación
                }
            }
        });
        if (error) throw error;
        
        // IMPORTANTE: Cerrar sesión inmediatamente
        // El usuario NO debe poder acceder hasta que sea aprobado por un admin
        await supabase.auth.signOut();
        
        return data;
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setProfile(null); // Clear profile on logout
    };

    const resetPassword = async (email) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
        });
        if (error) throw error;
        return data;
    };

    const updatePassword = async (newPassword) => {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });
        if (error) throw error;
        return data;
    };

    // Helper to get user display info
    const getUserDisplayName = () => {
        if (!user) return 'Usuario';
        const fullName = user.user_metadata?.full_name;
        if (fullName) return fullName;
        // Fallback to email username
        return user.email?.split('@')[0] || 'Usuario';
    };

    const getBusinessName = () => {
        if (!user) return '';
        return user.user_metadata?.business_name || '';
    };

    // Helper to get user role
    const getUserRole = () => {
        return profile?.role || 'manager';
    };

    // Helper to check if user has specific role
    const hasRole = (allowedRoles) => {
        const userRole = getUserRole();
        return Array.isArray(allowedRoles) ? allowedRoles.includes(userRole) : allowedRoles === userRole;
    };

    // Helper to check if user can access the system
    const canAccess = () => {
        return profile?.status === 'active' && profile?.is_active === true;
    };

    // Helper to get user status
    const getUserStatus = () => {
        return profile?.status || 'pending';
    };

    const value = {
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        getUserDisplayName,
        getBusinessName,
        getUserRole,
        hasRole,
        canAccess,
        getUserStatus,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

