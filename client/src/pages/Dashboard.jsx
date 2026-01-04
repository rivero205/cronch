import React, { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { api } from '../api';
import {
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Activity,
    Calendar,
    RefreshCw,
    Package
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const PERIODS = {
    today: { label: 'Hoy', value: 'today' },
    week: { label: 'Esta Semana', value: 'week' },
    month: { label: 'Este Mes', value: 'month' }
};

const Dashboard = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('week');

    // Date Calculation Logic
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

    useEffect(() => {
        fetchDashboardData();
    }, [selectedPeriod]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const { date, startDate, endDate } = getDateRange();
            // Use getDailyReport which handles both single date and range
            const data = await api.getDailyReport(date, startDate, endDate);
            setReport(data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            toast?.error('Error al cargar datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
            </div>
        );
    }

    // Prepare data
    const totalSales = report?.totalSales || 0;
    const totalExpenses = report?.totalExpenses || 0;
    // For single day, dailyProfit is just profit. For range, it's also total profit in this object structure.
    const totalProfit = report?.dailyProfit || 0;
    const topProducts = report?.topProducts || [];

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header with Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-brand-coffee">Dashboard</h2>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Calendar size={14} className="mr-1" />
                        {getPeriodLabel()}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Period Selector */}
                    <div className="bg-white rounded-lg shadow-sm p-1 flex border border-gray-100">
                        {Object.values(PERIODS).map((period) => (
                            <button
                                key={period.value}
                                onClick={() => setSelectedPeriod(period.value)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedPeriod === period.value
                                    ? 'bg-brand-orange text-white shadow-sm'
                                    : 'text-gray-500 hover:text-brand-coffee hover:bg-gray-50'
                                    }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={fetchDashboardData}
                        className="p-2 text-gray-400 hover:text-brand-orange transition-colors"
                        title="Actualizar"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sales Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-gray/10 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={60} className="text-green-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="text-sm font-semibold text-brand-coffee">Ventas Totales</h3>
                    </div>
                    <p className="text-2xl font-bold text-brand-coffee">
                        {formatCurrency(totalSales)}
                    </p>
                </div>

                {/* Expenses Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-gray/10 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShoppingBag size={60} className="text-red-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <Activity size={20} />
                        </div>
                        <h3 className="text-sm font-semibold text-brand-coffee">Gastos & Costos</h3>
                    </div>
                    <p className="text-2xl font-bold text-brand-coffee">
                        {formatCurrency(totalExpenses)}
                    </p>
                </div>

                {/* Profit Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-gray/10 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={60} className="text-brand-orange" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg text-brand-orange">
                            <DollarSign size={20} />
                        </div>
                        <h3 className="text-sm font-semibold text-brand-coffee">Ganancia Neta</h3>
                    </div>
                    <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-brand-coffee' : 'text-red-600'}`}>
                        {formatCurrency(totalProfit)}
                    </p>
                </div>
            </div>

            {/* Ranking Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-brand-gray/10 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-brand-coffee flex items-center gap-2">
                        <Package className="text-brand-orange" size={20} />
                        Ranking de Productos
                    </h3>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Top {topProducts.length}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-coffee uppercase tracking-wider"># Rank</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-coffee uppercase tracking-wider">Producto</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-brand-coffee uppercase tracking-wider">Cantidad</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-brand-coffee uppercase tracking-wider">Total Vendido</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-brand-coffee uppercase tracking-wider">Contribución</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {topProducts.map((product, index) => {
                                const contribution = totalSales > 0 ? (Number(product.sales_amount) / totalSales) * 100 : 0;
                                return (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                                                ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    index === 1 ? 'bg-gray-100 text-gray-700' :
                                                        index === 2 ? 'bg-orange-100 text-orange-800' : 'text-gray-500'}
                                            `}>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-brand-coffee">{product.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600 font-medium">
                                            {product.quantity_sold}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
                                            {formatCurrency(Number(product.sales_amount))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                                {contribution.toFixed(1)}%
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {topProducts.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No hay productos vendidos en este período.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
