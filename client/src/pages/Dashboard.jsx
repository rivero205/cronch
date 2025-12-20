import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { api } from '../api';
import StatCard from '../components/StatCard';
import { TrendingUp, AlertCircle } from 'lucide-react';

const Dashboard = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const today = format(new Date(), 'yyyy-MM-dd');

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const data = await api.getDailyReport(today);
            setReport(data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4 text-center">Cargando reporte de hoy...</div>;
    if (!report) return <div className="p-4 text-center text-red-500">Error al cargar datos.</div>;

    const profitClass = report.dailyProfit >= 0 ? 'success' : 'danger';
    const profitLabel = report.dailyProfit >= 0 ? 'Ganancia' : 'Pérdida';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-brand-dark">Resumen del Día ({today})</h2>
                <button
                    onClick={fetchReport}
                    className="text-sm text-brand-gold hover:underline"
                >
                    Actualizar
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Ventas Totales"
                    value={`$${report.totalSales.toLocaleString()}`}
                    type="warning"
                />
                <StatCard
                    title="Gastos Totales"
                    value={`$${report.totalExpenses.toLocaleString()}`}
                    type="default"
                />
                <StatCard
                    title={`Profit (${profitLabel})`}
                    value={`$${report.dailyProfit.toLocaleString()}`}
                    type={profitClass}
                    subtext="Ventas - Gastos (Cash Flow)"
                />
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center">
                    <TrendingUp className="mr-2 text-brand-gold" size={20} />
                    Rentabilidad por Producto
                </h3>

                {report.topProducts.length === 0 ? (
                    <p className="text-brand-gray italic">No hay ventas registradas aún.</p>
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
                                        <td className="px-4 py-3 text-right">${Number(p.sales_amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick Action Hint */}
            {report.totalSales === 0 && report.totalExpenses === 0 && (
                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start">
                    <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={18} />
                    <p className="text-sm">
                        ¡Bienvenido! Empieza registrando los <strong>Insumos</strong> del día, luego tu <strong>Producción</strong> y finalmente las <strong>Ventas</strong>.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
