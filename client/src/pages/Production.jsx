import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, Factory } from 'lucide-react';
import { format } from 'date-fns';

const Production = () => {
    const [production, setProduction] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        product_id: '',
        quantity: '',
        unit_cost: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [prodData, productsData] = await Promise.all([
                api.getProduction(),
                api.getProducts()
            ]);
            setProduction(prodData);
            setProducts(productsData);
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.product_id || !form.quantity || !form.unit_cost) return;

        try {
            setIsSubmitting(true);
            await api.addProduction({
                product_id: parseInt(form.product_id),
                quantity: parseInt(form.quantity),
                unit_cost: parseFloat(form.unit_cost),
                date: format(new Date(), 'yyyy-MM-dd')
            });
            setForm({ product_id: '', quantity: '', unit_cost: '' });
            // Reload only production list
            const prodData = await api.getProduction();
            setProduction(prodData);
        } catch (error) {
            console.error('Failed to add production', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-brand-dark">Gestionar Producción</h2>

            {/* Add Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-brand-gray mb-4 uppercase">Registrar Nuevo Lote</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                        className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold bg-white"
                        value={form.product_id}
                        onChange={e => setForm({ ...form, product_id: e.target.value })}
                        required
                    >
                        <option value="">Seleccionar Producto</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                        ))}
                    </select>

                    <input
                        type="number"
                        placeholder="Cantidad Hecha"
                        className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold"
                        value={form.quantity}
                        onChange={e => setForm({ ...form, quantity: e.target.value })}
                        required
                        min="1"
                    />

                    <input
                        type="number"
                        placeholder="Costo Unitario ($)"
                        className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold"
                        value={form.unit_cost}
                        onChange={e => setForm({ ...form, unit_cost: e.target.value })}
                        required
                        min="0"
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-brand-gold text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center"
                    >
                        {isSubmitting ? '...' : <><Plus size={20} className="mr-2" /> Agregar</>}
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <h3 className="text-sm font-medium text-brand-gray p-4 border-b uppercase">Historial Reciente</h3>
                {loading ? (
                    <div className="p-8 text-center text-brand-gray">Cargando...</div>
                ) : production.length === 0 ? (
                    <div className="p-8 text-center text-brand-gray">No hay producción registrada hoy.</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Producto</th>
                                <th className="px-6 py-3 text-right">Cantidad</th>
                                <th className="px-6 py-3 text-right">Costo Unitario</th>
                                <th className="px-6 py-3 text-right">Costo Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {production.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 text-brand-gray">
                                        {format(new Date(item.date), 'dd/MM/yyyy')}
                                    </td>
                                    <td className="px-6 py-3 font-medium text-brand-dark">{item.product_name}</td>
                                    <td className="px-6 py-3 text-right font-medium">{item.quantity}</td>
                                    <td className="px-6 py-3 text-right text-brand-gray">
                                        ${Number(item.unit_cost).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 text-right font-bold text-brand-dark">
                                        ${(Number(item.quantity) * Number(item.unit_cost)).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Production;
