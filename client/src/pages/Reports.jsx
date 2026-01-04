import React, { useState, useEffect } from 'react';
import ReportCard from '../components/ReportCard';
import ReportModal from '../components/ReportModal';
import GlobalReports from '../components/GlobalReports';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import {
    Calendar,
    BarChart3,
    TrendingUp,
    PieChart,
    Award,
    Globe,
    Building2,
    Search
} from 'lucide-react';

const Reports = () => {
    const { user, profile } = useAuth();

    // Debugging logs
    useEffect(() => {
        console.log('Reports Page - User:', user);
        console.log('Reports Page - Profile:', profile);
        console.log('Reports Page - Role:', profile?.role);
    }, [user, profile]);

    const isSuperAdmin = profile?.role === 'super_admin';

    // UI State
    const [activeTab, setActiveTab] = useState('global'); // 'global' or 'business'
    const [selectedReport, setSelectedReport] = useState(null);

    // Business Selector State (Super Admin Only)
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusinessId, setSelectedBusinessId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isSuperAdmin) {
            loadBusinesses();
        } else {
            setActiveTab('business'); // Standard admin always sees business view
        }
    }, [isSuperAdmin]);

    const loadBusinesses = async () => {
        try {
            const data = await api.getAllBusinesses();
            setBusinesses(data);
            if (data.length > 0) {
                // Determine which business to select first? Or let user select.
                // For now, let's keep it empty to force selection, or select first.
            }
        } catch (error) {
            console.error('Error loading businesses:', error);
        }
    };

    const filteredBusinesses = businesses.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const reportsList = [
        {
            id: 1,
            title: 'Resumen Semanal',
            icon: Calendar,
            description: 'Ventas, gastos y ganancia de la semana. Rentabilidad general.',
            details: 'Obtén una visión clara del rendimiento de tu semana. Este reporte consolida todos los ingresos y egresos para determianr el flujo de caja real.',
            dataPoints: ['Total Ventas', 'Total Gastos (Insumos)', 'Ganancia Neta', 'Promedio Diario'],
            allowedPeriods: 'week'
        },
        {
            id: 2,
            title: 'Resumen Mensual',
            icon: BarChart3,
            description: 'Visión macro del mes. Total de movimientos y promedios.',
            details: 'Evalúa el crecimiento de tu negocio a largo plazo. Ideal para comparativas mes a mes y planificación de presupuesto.',
            dataPoints: ['Ventas Mensuales', 'Gastos Mensuales', 'Ganancia del Mes', 'Proyección'],
            allowedPeriods: 'month'
        },
        {
            id: 3,
            title: 'Rentabilidad por Producto',
            icon: PieChart,
            description: 'Desglose detallado de ganancias por cada ítem del menú.',
            details: 'Identifica tus productos estrella y los que necesitan ajustes. Analiza costo vs precio de venta real.',
            dataPoints: ['Cantidad Vendida', 'Ingreso por Producto', 'Costo Producción', 'Margen de Ganancia'],
            allowedPeriods: 'both' // Or 'month' if preferred, but user implied flexibility
        },
        {
            id: 4,
            title: 'Tendencia Diaria',
            icon: TrendingUp,
            description: 'Análisis día a día para identificar picos y valles de venta.',
            details: 'Descubre patrones de comportamiento en tus clientes. ¿Qué días vendes más? ¿Qué días son más lentos?',
            dataPoints: ['Ventas por Día', 'Gastos por Día', 'Ganancia Diaria'],
            allowedPeriods: 'week'
        },
        {
            id: 5,
            title: 'Producto Más Rentable',
            icon: Award,
            description: 'El MVP de tu menú. ¿Qué producto te está dando más dinero?',
            details: 'Reporte enfocado exclusivamente en el ganador del período. Útil para lanzar promociones o destacar productos.',
            dataPoints: ['Producto Ganador', 'Total Ganancia Generada', 'Volumen de Ventas'],
            allowedPeriods: 'both' // "Semana o Mes seleccionado"
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-brand-coffee">Centro de Reportes</h2>
                <p className="text-brand-gray">Genera insights valiosos para tomar mejores decisiones.</p>
            </div>

            {/* Super Admin Tabs */}
            {isSuperAdmin && (
                <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('global')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'global'
                            ? 'bg-white text-brand-orange shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Globe size={18} />
                        Visión Global
                    </button>
                    <button
                        onClick={() => setActiveTab('business')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'business'
                            ? 'bg-white text-brand-orange shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Building2 size={18} />
                        Por Negocio
                    </button>
                </div>
            )}

            {/* Global View */}
            {isSuperAdmin && activeTab === 'global' && (
                <GlobalReports />
            )}

            {/* Business View (Standard or Selected) */}
            {activeTab === 'business' && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Business Selector for Super Admin */}
                    {isSuperAdmin && (
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-gray/10">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Seleccionar Negocio para Analizar
                            </label>
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    value={selectedBusinessId}
                                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange bg-white appearance-none"
                                >
                                    <option value="">-- Seleccionar un negocio --</option>
                                    {businesses.map(b => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {!selectedBusinessId && (
                                <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded-lg inline-block">
                                    ⚠️ Selecciona un negocio para ver sus reportes específicos.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Report Grid */}
                    {(!isSuperAdmin || selectedBusinessId) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reportsList.map(report => (
                                <ReportCard
                                    key={report.id}
                                    title={report.title}
                                    icon={report.icon}
                                    description={report.description}
                                    onClick={() => setSelectedReport(report)}
                                />
                            ))}
                        </div>
                    )}

                    {selectedReport && (
                        <ReportModal
                            report={selectedReport}
                            onClose={() => setSelectedReport(null)}
                            selectedBusinessId={selectedBusinessId} // Pass override ID
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default Reports;
