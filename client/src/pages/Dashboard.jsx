import React, { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { api } from '../api';
import StatCard from '../components/StatCard';
import { TrendingUp, TrendingDown, Calendar, RefreshCw, AlertCircle } from 'lucide-react';

const PERIODS = {
    today: { label: 'Hoy', value: 'today' },
    week: { label: 'Esta Semana', value: 'week' },
    month: { label: 'Este Mes', value: 'month' }
};

const Dashboard = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('week'); // Default to week
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReport();
    }, [selectedPeriod]);

    const getDateRange = () => {
        const now = new Date();

        switch (selectedPeriod) {
            case 'today':
                const today = format(now, 'yyyy-MM-dd');
                return { date: today, startDate: null, endDate: null };
            case 'week':
                return {
                    date: null,
                    startDate: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                    endDate: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
                };
            case 'month':
                return {
                    date: null,
                    startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
                    endDate: format(endOfMonth(now), 'yyyy-MM-dd')
                };
            default:
                return { date: format(now, 'yyyy-MM-dd'), startDate: null, endDate: null };
        }
    };

    const fetchReport = async () => {
        try {
            setLoading(true);
            setError(null);
            const { date, startDate, endDate } = getDateRange();
            const data = await api.getDailyReport(date, startDate, endDate);
            setReport(data);
        } catch (err) {
            console.error('Error loading dashboard:', err);
            setError('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const getPeriodLabel = () => {
        const { date, startDate, endDate } = getDateRange();
        if (date) {
            return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es });
        }
        if (startDate && endDate) {
            return `${format(new Date(startDate), "d MMM", { locale: es })} - ${format(new Date(endDate), "d MMM, yyyy", { locale: es })}`;
        }
        return '';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <RefreshCw className="animate-spin text-brand-gold mr-2" size={24} />
                <span className="text-brand-gray">Cargando datos...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="mr-2" size={20} />
                {error}
            </div>
        );
    }

    const hasData = report && (report.totalSales > 0 || report.totalExpenses > 0);
    const profitClass = report?.dailyProfit >= 0 ? 'success' : 'danger';
    const profitLabel = report?.dailyProfit >= 0 ? 'Ganancia' : 'Pérdida';
    const isRange = selectedPeriod !== 'today';

    return (
        <div className="space-y-6">
            {/* Header with Period Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-brand-dark">Dashboard</h2>
                    <p className="text-sm text-brand-gray flex items-center mt-1">
                        <Calendar size={14} className="mr-1" />
                        {getPeriodLabel()}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Period Selector */}
                    <div className="bg-white rounded-lg shadow-sm p-1 flex">
                        {Object.values(PERIODS).map((period) => (
                            <button
                                key={period.value}
                                onClick={() => setSelectedPeriod(period.value)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedPeriod === period.value
                                        ? 'bg-brand-gold text-white'
                                        : 'text-brand-gray hover:text-brand-dark hover:bg-gray-50'
                                    }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={fetchReport}
                        className="p-2 text-brand-gray hover:text-brand-gold transition-colors"
                        title="Actualizar"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {!hasData && (
                <div className="bg-blue-50 text-blue-800 p-6 rounded-lg">
                    <div className="flex items-start">
                        <AlertCircle className="mr-3 mt-0.5 flex-shrink-0" size={20} />
                        <div>
                            <p className="font-medium">No hay datos para este período</p>
                            <p className="text-sm mt-1 opacity-80">
                                {selectedPeriod === 'today'
                                    ? 'No se han registrado ventas ni gastos hoy. Prueba viendo "Esta Semana" para ver datos anteriores.'
                                    : 'Empieza registrando Insumos, luego Producción y finalmente Ventas.'}
                            </p>
                            {selectedPeriod === 'today' && (
                                <button
                                    onClick={() => setSelectedPeriod('week')}
                                    className="mt-3 text-sm bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md transition-colors"
                                >
                                    Ver Esta Semana
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            {hasData && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            title="Ventas Totales"
                            value={`$${report.totalSales?.toLocaleString() || 0}`}
                            type="warning"
                            subtext={isRange && report.dailyAverageSales
                                ? `Promedio: $${Math.round(report.dailyAverageSales).toLocaleString()}/día`
                                : null}
                        />
                        <StatCard
                            title="Gastos Totales"
                            value={`$${report.totalExpenses?.toLocaleString() || 0}`}
                            type="default"
                        />
                        <StatCard
                            title={`${profitLabel} Neta`}
                            value={`$${Math.abs(report.dailyProfit || 0).toLocaleString()}`}
                            type={profitClass}
                            subtext={isRange && report.dailyAverageProfit
                                ? `Promedio: $${Math.round(Math.abs(report.dailyAverageProfit)).toLocaleString()}/día`
                                : "Ventas - Gastos"}
                        />
                    </div>

                    {/* Period Summary */}
                    {isRange && report.daysInPeriod && (
                        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                            <span className="text-sm text-brand-gray">
                                Período de <strong className="text-brand-dark">{report.daysInPeriod} días</strong>
                            </span>
                            <div className="flex items-center">
                                {report.dailyProfit >= 0 ? (
                                    <TrendingUp className="text-green-500 mr-1" size={18} />
                                ) : (
                                    <TrendingDown className="text-red-500 mr-1" size={18} />
                                )}
                                <span className={`text-sm font-medium ${report.dailyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {report.dailyProfit >= 0 ? 'En ganancia' : 'En pérdida'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Top Products */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center">
                            <TrendingUp className="mr-2 text-brand-gold" size={20} />
                            Productos Más Vendidos
                        </h3>

                        {(!report.topProducts || report.topProducts.length === 0) ? (
                            <p className="text-brand-gray italic">No hay ventas registradas en este período.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-brand-dark">
                                    <thead className="text-xs text-brand-gray uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3">Producto</th>
                                            <th className="px-4 py-3 text-right">Cantidad</th>
                                            <th className="px-4 py-3 text-right">Total Vendido</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.topProducts.map((p, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium">{p.name}</td>
                                                <td className="px-4 py-3 text-right">{p.quantity_sold}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-brand-gold">
                                                    ${Number(p.sales_amount).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
