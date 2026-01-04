import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Download, Loader2, FileText } from 'lucide-react';
import { api } from '../api';

const ReportModal = ({ report, onClose }) => {
    // Determine default period based on report configuration
    const defaultPeriod = report?.allowedPeriods === 'month' ? 'month' : 'week';
    const [period, setPeriod] = useState(defaultPeriod); // week, month
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);

    if (!report) return null;

    // Helper to get week dates from a reference date
    const getWeekDates = (referenceDate) => {
        const d = new Date(referenceDate);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        return {
            start: monday.toISOString().split('T')[0],
            end: sunday.toISOString().split('T')[0]
        };
    };

    // Helper to get month dates
    const getMonthDates = (monthStr) => {
        const [year, month] = monthStr.split('-');
        const lastDay = new Date(year, month, 0).getDate();
        return {
            start: `${year}-${month}-01`,
            end: `${year}-${month}-${lastDay.toString().padStart(2, '0')}`
        };
    };

    const handleGenerate = async () => {
        if (!date) {
            setError('Por favor selecciona una fecha');
            return;
        }

        setLoading(true);
        setError(null);
        setReportData(null);

        try {
            let data;

            switch (report.id) {
                case 1: // Resumen Semanal
                    data = await api.getWeeklyReport(date);
                    break;

                case 2: // Resumen Mensual
                    data = await api.getMonthlyReport(date);
                    break;

                case 3: { // Rentabilidad por Producto
                    const dates = period === 'month' ? getMonthDates(date) : getWeekDates(date);
                    data = await api.getProductProfitability(dates.start, dates.end);
                    break;
                }

                case 4: { // Tendencia Diaria
                    const dates = getWeekDates(date);
                    data = await api.getDailyTrend(dates.start, dates.end);
                    break;
                }

                case 5: { // Producto Más Rentable
                    const dates = period === 'month' ? getMonthDates(date) : getWeekDates(date);
                    data = await api.getMostProfitable(dates.start, dates.end);
                    break;
                }

                default:
                    throw new Error('Reporte no implementado');
            }

            setReportData(data);
        } catch (err) {
            setError(err.message || 'Error al generar el reporte');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value);
    };

    const handleDownloadReport = async () => {
        if (!date || !reportData) {
            setError('Por favor genera el reporte primero');
            return;
        }

        setDownloadLoading(true);
        setError(null);

        try {
            let detailedData;

            // Generate filename based on report type and dates
            let filename = 'reporte.xlsx';
            let blob;

            switch (report.id) {
                case 1: // Resumen Semanal
                    blob = await api.getDetailedWeeklyReport(date);
                    filename = `Reporte_Semanal_${date}.xlsx`;
                    break;

                case 2: // Resumen Mensual
                    blob = await api.getDetailedMonthlyReport(date);
                    filename = `Reporte_Mensual_${date}.xlsx`;
                    break;

                case 3: { // Rentabilidad por Producto
                    const dates = period === 'month' ? getMonthDates(date) : getWeekDates(date);
                    blob = await api.getDetailedProductProfitability(dates.start, dates.end);
                    filename = `Rentabilidad_Productos_${dates.start}_${dates.end}.xlsx`;
                    break;
                }

                case 4: { // Tendencia Diaria
                    const dates = getWeekDates(date);
                    blob = await api.getDetailedDailyTrend(dates.start, dates.end);
                    filename = `Tendencia_Diaria_${dates.start}_${dates.end}.xlsx`;
                    break;
                }

                case 5: { // Producto Más Rentable
                    const dates = period === 'month' ? getMonthDates(date) : getWeekDates(date);
                    blob = await api.getDetailedMostProfitable(dates.start, dates.end);
                    filename = `Producto_Mas_Rentable_${dates.start}_${dates.end}.xlsx`;
                    break;
                }

                default:
                    throw new Error('Reporte no implementado');
            }

            // Trigger download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err) {
            setError(err.message || 'Error al descargar el reporte');
        } finally {
            setDownloadLoading(false);
        }
    };

    // Legacy text generation functions removed


    const renderReportData = () => {
        if (!reportData) return null;

        switch (report.id) {
            case 1: // Resumen Semanal
                return (
                    <div className="bg-green-50 p-4 rounded-xl space-y-3">
                        <h5 className="font-bold text-brand-coffee">Resultados de la Semana</h5>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-600">Período:</p>
                                <p className="font-semibold">{reportData.period.start} - {reportData.period.end}</p>
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
                    <div className="bg-blue-50 p-4 rounded-xl space-y-3">
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

            case 3: // Rentabilidad por Producto
                return (
                    <div className="bg-purple-50 p-4 rounded-xl space-y-3 max-h-96 overflow-y-auto">
                        <h5 className="font-bold text-brand-coffee">Rentabilidad por Producto</h5>
                        <p className="text-xs text-gray-600">Período: {reportData.period.start} - {reportData.period.end}</p>
                        {reportData.products.map(product => (
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

            case 4: // Tendencia Diaria
                return (
                    <div className="bg-orange-50 p-4 rounded-xl space-y-3 max-h-96 overflow-y-auto">
                        <h5 className="font-bold text-brand-coffee">Tendencia Diaria</h5>
                        <p className="text-xs text-gray-600">Semana: {reportData.period.start} - {reportData.period.end}</p>
                        {reportData.dailyData.map((day, idx) => (
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

            case 5: // Producto Más Rentable
                if (!reportData.product) {
                    return (
                        <div className="bg-yellow-50 p-4 rounded-xl">
                            <p className="text-center text-gray-600">{reportData.message}</p>
                        </div>
                    );
                }
                return (
                    <div className="bg-yellow-50 p-4 rounded-xl space-y-3">
                        <h5 className="font-bold text-brand-coffee flex items-center gap-2">
                            <span className="text-2xl">🏆</span> Producto Más Rentable
                        </h5>
                        <p className="text-xs text-gray-600">Período: {reportData.period.start} - {reportData.period.end}</p>
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
                    {!reportData && (
                        <>
                            <div>
                                <h4 className="font-semibold text-brand-coffee mb-2">Descripción</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{report.details}</p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-brand-coffee mb-2">Datos Incluidos</h4>
                                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                                    {report.dataPoints.map((point, idx) => (
                                        <li key={idx}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}

                    {/* Controls */}
                    <div className="bg-gray-50 p-4 rounded-xl space-y-4">
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
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
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
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Report Data Display */}
                    {renderReportData()}
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 sticky bottom-0 bg-white space-y-3">
                    {/* Download Button - Only show if report data exists */}
                    {reportData && (
                        <button
                            onClick={handleDownloadReport}
                            disabled={downloadLoading}
                            className="w-full py-3 px-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {downloadLoading ? (
                                <>
                                    <Loader2 size={20} className="mr-2 animate-spin" />
                                    Descargando...
                                </>
                            ) : (
                                <>
                                    <Download size={20} className="mr-2" />
                                    Descargar Reporte Detallado
                                </>
                            )}
                        </button>
                    )}

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="mr-2 animate-spin" />
                                Generando...
                            </>
                        ) : (
                            <>
                                <FileText size={20} className="mr-2" />
                                Generar Reporte
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ReportModal;
