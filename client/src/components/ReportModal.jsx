import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Download, Loader2, FileText, Play } from 'lucide-react';
import { api } from '../api';
import { useToast } from '../contexts/ToastContext';

const ReportModal = ({ report, onClose, selectedBusinessId }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [reportData, setReportData] = useState(null);

    // Determine default period logic
    const [period, setPeriod] = useState(() => {
        if (report?.allowedPeriods === 'month') return 'month';
        return 'week';
    });

    // Date Input State
    const [dateValue, setDateValue] = useState(() => {
        const d = new Date();
        return d.toISOString().split('T')[0]; // Default to today
    });

    // We calculate the actual start/end range whenever period or dateValue changes
    const [computedRange, setComputedRange] = useState({ start: '', end: '' });

    // Formatting helper
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Calculate computed range
    useEffect(() => {
        if (!dateValue) return;

        let start = '';
        let end = '';

        if (period === 'week') {
            const d = new Date(dateValue);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(d);
            monday.setDate(diff);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            start = monday.toISOString().split('T')[0];
            end = sunday.toISOString().split('T')[0];

        } else if (period === 'month') {
            let year, month;
            if (dateValue.length === 7) {
                [year, month] = dateValue.split('-');
            } else {
                const d = new Date(dateValue);
                year = d.getFullYear();
                month = d.getMonth() + 1;
            }

            const lastDayDate = new Date(year, month, 0);
            const daysInMonth = lastDayDate.getDate();

            start = `${year}-${month.toString().padStart(2, '0')}-01`;
            end = `${year}-${month.toString().padStart(2, '0')}-${daysInMonth}`;
        }

        setComputedRange({ start, end });
        // NOTE: Auto-fetch removed as per user request
    }, [dateValue, period]);

    const handleFetchData = async () => {
        // Reset previous data to show loading state or keep it? 
        // User wants description to disappear when generated. 
        // So valid flow: Description -> Loading -> Data.
        setLoading(true);
        setReportData(null); // Clear previous data to hide results and show loading

        try {
            const { start, end } = computedRange;
            let result;

            switch (report.id) {
                case 1: // Weekly
                    result = await api.getWeeklyReport(start, selectedBusinessId);
                    break;
                case 2: // Monthly
                    const monthStr = start.substring(0, 7);
                    result = await api.getMonthlyReport(monthStr, selectedBusinessId);
                    break;
                case 3: // Product Profitability
                    result = await api.getProductProfitability(start, end, selectedBusinessId);
                    break;
                case 4: // Daily Trend
                    result = await api.getDailyTrend(start, end, selectedBusinessId);
                    break;
                case 5: // Most Profitable
                    result = await api.getMostProfitable(start, end, selectedBusinessId);
                    break;
                default:
                    break;
            }
            setReportData(result);
        } catch (error) {
            console.error('Error fetching report:', error);
            toast.error('Error al generar el reporte');
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            let blob;
            let filename = `reporte.xlsx`;
            const { start, end } = computedRange;

            switch (report.id) {
                case 1:
                    blob = await api.getDetailedWeeklyReport(start, selectedBusinessId);
                    filename = `reporte-semanal-${start}.xlsx`;
                    break;
                case 2:
                    const monthStr = start.substring(0, 7);
                    blob = await api.getDetailedMonthlyReport(monthStr, selectedBusinessId);
                    filename = `reporte-mensual-${monthStr}.xlsx`;
                    break;
                case 3:
                    blob = await api.getDetailedProductProfitability(start, end, selectedBusinessId);
                    filename = `rentabilidad-productos-${start}.xlsx`;
                    break;
                case 4:
                    blob = await api.getDetailedDailyTrend(start, end, selectedBusinessId);
                    filename = `tendencia-diaria-${start}.xlsx`;
                    break;
                case 5:
                    blob = await api.getDetailedMostProfitable(start, end, selectedBusinessId);
                    filename = `mas-rentable-${start}.xlsx`;
                    break;
                default:
                    throw new Error('Descarga no soportada');
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error(err);
            toast.error("Error al descargar reporte");
        } finally {
            setDownloading(false);
        }
    };

    const renderReportData = () => {
        // If loading, show spinner (handled in parent render), if no data, show nothing (or description)
        if (!reportData) return null;

        switch (report.id) {
            case 1: // Resumen Semanal
                return (
                    <div className="bg-green-50 p-4 rounded-xl space-y-3 animate-fadeIn">
                        <h5 className="font-bold text-brand-coffee">Resultados de la Semana</h5>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-600">Período:</p>
                                <p className="font-semibold">{reportData.period?.start} - {reportData.period?.end}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Total Ventas:</p>
                                <p className="font-semibold text-green-600">{formatCurrency(reportData.totalSales)}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Total Gastos:</p>
                                <p className="font-semibold text-red-600">{formatCurrency(reportData.totalExpenses)}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Ganancia Semanal:</p>
                                <p className={`font-bold text-lg ${reportData.weeklyProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {formatCurrency(reportData.weeklyProfit)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Promedio Ventas/Día:</p>
                                <p className="font-semibold">{formatCurrency(reportData.dailyAverageSales)}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Promedio Ganancia/Día:</p>
                                <p className="font-semibold">{formatCurrency(reportData.dailyAverageProfit)}</p>
                            </div>
                        </div>
                    </div>
                );

            case 2: // Resumen Mensual
                return (
                    <div className="bg-blue-50 p-4 rounded-xl space-y-3 animate-fadeIn">
                        <h5 className="font-bold text-brand-coffee">Resultados del Mes</h5>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-600">Mes:</p>
                                <p className="font-semibold">{reportData.month}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Días del mes:</p>
                                <p className="font-semibold">{reportData.daysInMonth}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Total Ventas:</p>
                                <p className="font-semibold text-green-600">{formatCurrency(reportData.totalSales)}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Total Gastos:</p>
                                <p className="font-semibold text-red-600">{formatCurrency(reportData.totalExpenses)}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-gray-600">Ganancia Mensual:</p>
                                <p className={`font-bold text-xl ${reportData.monthlyProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {formatCurrency(reportData.monthlyProfit)}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-gray-600">Promedio Diario:</p>
                                <p className="font-semibold">{formatCurrency(reportData.dailyAverage)}</p>
                            </div>
                        </div>
                    </div>
                );

            case 3: // Rentabilidad
                return (
                    <div className="bg-purple-50 p-4 rounded-xl space-y-3 max-h-96 overflow-y-auto animate-fadeIn">
                        <h5 className="font-bold text-brand-coffee">Rentabilidad por Producto</h5>
                        <p className="text-xs text-gray-600">Período: {reportData.period?.start} - {reportData.period?.end}</p>
                        {reportData.products?.map(product => (
                            <div key={product.id} className="bg-white p-3 rounded-lg border border-purple-200">
                                <h6 className="font-bold text-brand-coffee mb-2">{product.name}</h6>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-gray-600">Cantidad vendida:</p>
                                        <p className="font-semibold">{product.quantitySold}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Total vendido:</p>
                                        <p className="font-semibold text-green-600">{formatCurrency(product.totalSales)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Costo producción:</p>
                                        <p className="font-semibold text-red-600">{formatCurrency(product.productionCost)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Ganancia:</p>
                                        <p className={`font-bold ${product.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                            {formatCurrency(product.profit)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 4: // Tendencia
                return (
                    <div className="bg-orange-50 p-4 rounded-xl space-y-3 max-h-96 overflow-y-auto animate-fadeIn">
                        <h5 className="font-bold text-brand-coffee">Tendencia Diaria</h5>
                        <p className="text-xs text-gray-600">Período: {reportData.period?.start} - {reportData.period?.end}</p>
                        {reportData.dailyData?.map((day, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-orange-200">
                                <h6 className="font-bold text-brand-coffee mb-2">{day.date}</h6>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <p className="text-gray-600">Ventas:</p>
                                        <p className="font-semibold text-green-600">{formatCurrency(day.sales)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Gastos:</p>
                                        <p className="font-semibold text-red-600">{formatCurrency(day.expenses)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Ganancia:</p>
                                        <p className={`font-bold ${day.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                            {formatCurrency(day.profit)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 5: // MVP
                if (!reportData.product) {
                    return (
                        <div className="bg-yellow-50 p-4 rounded-xl animate-fadeIn">
                            <p className="text-center text-gray-600">{reportData.message || 'No hay datos'}</p>
                        </div>
                    );
                }
                return (
                    <div className="bg-yellow-50 p-4 rounded-xl space-y-3 animate-fadeIn">
                        <h5 className="font-bold text-brand-coffee flex items-center gap-2">
                            <span className="text-2xl">🏆</span> Producto Más Rentable
                        </h5>
                        <p className="text-xs text-gray-600">Período: {reportData.period?.start} - {reportData.period?.end}</p>
                        <div className="bg-white p-4 rounded-lg border-2 border-yellow-400">
                            <h6 className="font-bold text-xl text-brand-coffee mb-3">{reportData.product.name}</h6>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-600">Cantidad vendida:</p>
                                    <p className="font-bold text-lg">{reportData.product.quantitySold}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Total vendido:</p>
                                    <p className="font-bold text-lg text-green-600">{formatCurrency(reportData.product.totalSales)}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-600">Ganancia generada:</p>
                                    <p className="font-bold text-2xl text-green-700">{formatCurrency(reportData.product.profit)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!report) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center space-x-3">
                        <div className="bg-brand-orange/10 p-2 rounded-lg">
                            <report.icon className="text-brand-orange" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-brand-coffee">{report.title}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Description - Only visible if no data has been generated yet */}
                    {!reportData && !loading && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex gap-3">
                                <FileText className="text-brand-gray flex-shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                        {report.details || report.description}
                                    </p>
                                    {report.dataPoints && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {report.dataPoints.map((point, i) => (
                                                <span key={i} className="text-xs bg-white px-2 py-1 rounded-md border border-gray-200 text-gray-500 font-medium shadow-sm">
                                                    {point}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <h4 className="font-semibold text-sm text-brand-coffee flex items-center">
                            <Calendar size={16} className="mr-2" />
                            Configuración
                        </h4>

                        <div className="flex flex-col gap-3">
                            {/* Period Selector - Only show if report supports both */}
                            {report.allowedPeriods === 'both' ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <select
                                        className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                                        value={period}
                                        onChange={(e) => setPeriod(e.target.value)}
                                    >
                                        <option value="week">Semanal</option>
                                        <option value="month">Mensual</option>
                                    </select>

                                    <input
                                        type={period === 'month' ? 'month' : 'date'}
                                        className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                                        value={dateValue}
                                        onChange={(e) => setDateValue(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Seleccionar {report.allowedPeriods === 'month' ? 'Mes' : 'Semana'}
                                    </label>
                                    <input
                                        type={report.allowedPeriods === 'month' ? 'month' : 'date'}
                                        className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                                        value={dateValue}
                                        onChange={(e) => setDateValue(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Super Admin Notice */}
                            {selectedBusinessId && (
                                <div className="text-xs text-brand-orange font-medium bg-orange-50 px-2 py-1 rounded">
                                    Viendo datos de Negocio ID: {selectedBusinessId}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results Area */}
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 size={32} className="text-brand-orange animate-spin" />
                        </div>
                    ) : (
                        renderReportData()
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 pt-0 sticky bottom-0 bg-white border-t border-gray-50 pt-4 mt-6">
                    <div className="flex gap-3">
                        {/* Generation Button - Always visible, text changes if update */}
                        <button
                            onClick={handleFetchData}
                            disabled={loading || !dateValue}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex justify-center items-center
                                ${reportData
                                    ? 'bg-white border-2 border-brand-orange text-brand-orange hover:bg-orange-50'
                                    : 'bg-brand-orange text-white hover:bg-orange-600 py-4 text-lg'
                                }`}
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    {reportData ? <RefreshCwIcon size={20} className="mr-2" /> : <Play size={20} className="mr-2 fill-current" />}
                                    {reportData ? 'Actualizar Reporte' : 'Generar Reporte'}
                                </>
                            )}
                        </button>

                        {/* Download Button - Only visible if data exists */}
                        {reportData && (
                            <button
                                onClick={handleDownload}
                                disabled={downloading || loading}
                                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex justify-center items-center disabled:opacity-50"
                            >
                                {downloading ? (
                                    <>
                                        <Loader2 size={20} className="mr-2 animate-spin" />
                                        Descargando...
                                    </>
                                ) : (
                                    <>
                                        <Download size={20} className="mr-2" />
                                        Descargar Detallado
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

// Simple Refresh icon component to avoid import error if not imported above
const RefreshCwIcon = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M3 21v-5h5" />
    </svg>
);

export default ReportModal;
