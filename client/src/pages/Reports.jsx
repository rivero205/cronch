import React, { useState } from 'react';
import ReportCard from '../components/ReportCard';
import ReportModal from '../components/ReportModal';
import {
    Calendar,
    BarChart3,
    TrendingUp,
    PieChart,
    Award
} from 'lucide-react';

const Reports = () => {
    const [selectedReport, setSelectedReport] = useState(null);

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

            {selectedReport && (
                <ReportModal
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                />
            )}
        </div>
    );
};

export default Reports;
