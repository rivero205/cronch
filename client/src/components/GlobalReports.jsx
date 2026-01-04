import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useToast } from '../contexts/ToastContext';
import {
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Users,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Building2
} from 'lucide-react';

const GlobalReports = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [ranking, setRanking] = useState([]);

    // Default to current month
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    });

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [summaryData, rankingData] = await Promise.all([
                api.getGlobalSummary(startDate, endDate),
                api.getBusinessRanking(startDate, endDate, 10)
            ]);

            setSummary(summaryData);
            setRanking(rankingData);
        } catch (error) {
            console.error('Error fetching global reports:', error);
            toast.error('Error al cargar reportes globales');
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
        }).format(amount);
    };

    if (loading && !summary) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-gray/10 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha Inicio</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha Fin</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all"
                    />
                </div>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200/50"
                >
                    Actualizar
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-gray/10 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={60} className="text-green-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-500">Ventas Totales</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {summary ? formatCurrency(summary.totalSales) : '-'}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-gray/10 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShoppingBag size={60} className="text-red-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <Activity size={20} />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-500">Gastos & Costos</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {summary ? formatCurrency(summary.totalExpenses) : '-'}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-gray/10 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={60} className="text-brand-orange" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg text-brand-orange">
                            <DollarSign size={20} />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-500">Ganancia Neta</h3>
                    </div>
                    <p className={`text-2xl font-bold ${(summary?.totalProfit || 0) >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {summary ? formatCurrency(summary.totalProfit) : '-'}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-gray/10 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={60} className="text-blue-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Building2 size={20} />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-500">Negocios Activos</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {summary ? summary.activeBusinesses : '-'}
                    </p>
                </div>
            </div>

            {/* Ranking Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-brand-gray/10 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="text-brand-orange" size={20} />
                        Ranking de Negocios
                    </h3>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Top 10 por Ventas
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"># Rank</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Negocio</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ventas</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Gastos</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ganancia</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Margen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ranking.map((business, index) => {
                                const margin = business.sales > 0 ? (business.profit / business.sales) * 100 : 0;
                                return (
                                    <tr key={business.id} className="hover:bg-gray-50/50 transition-colors">
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
                                            <div className="text-sm font-semibold text-gray-900">{business.name}</div>
                                            <div className="text-xs text-gray-400">ID: {business.id.substring(0, 8)}...</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600 font-medium">
                                            {formatCurrency(business.sales)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-500">
                                            {formatCurrency(business.expenses)}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${business.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(business.profit)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
                                                ${margin >= 30 ? 'bg-green-100 text-green-700' :
                                                    margin >= 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                                            `}>
                                                {margin.toFixed(1)}%
                                                {margin >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {ranking.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No hay datos disponibles para el período seleccionado.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalReports;
