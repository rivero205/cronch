import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, Factory, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const Production = () => {
    const [production, setProduction] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingProduction, setEditingProduction] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productionToDelete, setProductionToDelete] = useState(null);

    const { showSuccess, showError } = useToast();

    const [form, setForm] = useState({
        product_id: '',
        quantity: '',
        unit_cost: '',
        date: format(new Date(), 'yyyy-MM-dd')
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
            setProduction(Array.isArray(prodData) ? prodData : []);
            setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (error) {
            console.error('Failed to load data', error);
            showError('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingProduction(item);
        setForm({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            date: item.date ? format(new Date(item.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
        });
    };

    const handleDeleteClick = (item) => {
        setProductionToDelete(item);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!productionToDelete) return;

        try {
            await api.deleteProduction(productionToDelete.id);
            // Refresh logic
            const prodData = await api.getProduction();
            setProduction(Array.isArray(prodData) ? prodData : []);
            showSuccess('Producción eliminada exitosamente');
        } catch (error) {
            console.error('Failed to delete production', error);
            showError('Error al eliminar producción');
        } finally {
            setProductionToDelete(null);
        }
    };

    const resetForm = () => {
        setForm({ product_id: '', quantity: '', unit_cost: '', date: format(new Date(), 'yyyy-MM-dd') });
        setEditingProduction(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.product_id || !form.quantity || !form.unit_cost) return;

        try {
            setIsSubmitting(true);

            const payload = {
                product_id: parseInt(form.product_id),
                quantity: parseInt(form.quantity),
                unit_cost: parseFloat(form.unit_cost),
                date: form.date
            };

            if (editingProduction) {
                await api.updateProduction(editingProduction.id, payload);
                showSuccess('Producción actualizada exitosamente');
            } else {
                await api.addProduction(payload);
                showSuccess('Producción agregada exitosamente');
            }

            resetForm();
            const prodData = await api.getProduction();
            setProduction(Array.isArray(prodData) ? prodData : []);
        } catch (error) {
            console.error('Failed to save production', error);
            showError('Error al guardar producción');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-brand-dark">Gestionar Producción</h2>

            {/* Add/Edit Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-brand-gray uppercase">
                        {editingProduction ? 'Editar Producción' : 'Registrar Nuevo Lote'}
                    </h3>
                    {editingProduction && (
                        <button
                            onClick={resetForm}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                            Cancelar Edición
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Producto</label>
                        <select
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold bg-white"
                            value={form.product_id}
                            onChange={e => setForm({ ...form, product_id: e.target.value })}
                            required
                        >
                            <option value="">Seleccionar Producto</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                        <input
                            type="number"
                            placeholder="Cantidad"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold"
                            value={form.quantity}
                            onChange={e => setForm({ ...form, quantity: e.target.value })}
                            required
                            min="1"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Costo Unit. ($)</label>
                        <input
                            type="number"
                            placeholder="Costo"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold"
                            value={form.unit_cost}
                            onChange={e => setForm({ ...form, unit_cost: e.target.value })}
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Fecha</label>
                        <input
                            type="date"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold"
                            value={form.date}
                            onChange={e => setForm({ ...form, date: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center whitespace-nowrap ${editingProduction
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-brand-gold hover:bg-opacity-90 text-white'
                            }`}
                    >
                        {isSubmitting ? '...' : (
                            editingProduction ? 'Actualizar' : <><Plus size={20} className="mr-2" /> Agregar</>
                        )}
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <h3 className="text-sm font-medium text-brand-gray p-4 border-b uppercase">Historial Reciente</h3>
                {loading ? (
                    <div className="p-8 text-center text-brand-gray">Cargando...</div>
                ) : production.length === 0 ? (
                    <div className="p-8 text-center text-brand-gray">No hay producción registrada.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[600px]">
                            <thead className="bg-gray-50 text-gray-500 border-b">
                                <tr>
                                    <th className="px-4 md:px-6 py-3 whitespace-nowrap">Fecha</th>
                                    <th className="px-4 md:px-6 py-3 whitespace-nowrap">Producto</th>
                                    <th className="px-4 md:px-6 py-3 text-right whitespace-nowrap">Cantidad</th>
                                    <th className="px-4 md:px-6 py-3 text-right whitespace-nowrap">Costo Unitario</th>
                                    <th className="px-4 md:px-6 py-3 text-right whitespace-nowrap">Costo Total</th>
                                    <th className="px-4 md:px-6 py-3 text-right whitespace-nowrap">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {production.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 md:px-6 py-3 text-brand-gray whitespace-nowrap">
                                            {format(new Date(item.date), 'dd/MM/yyyy')}
                                        </td>
                                        <td className="px-4 md:px-6 py-3 font-medium text-brand-dark">{item.product_name}</td>
                                        <td className="px-4 md:px-6 py-3 text-right font-medium">{item.quantity}</td>
                                        <td className="px-4 md:px-6 py-3 text-right text-brand-gray whitespace-nowrap">
                                            ${Number(item.unit_cost).toLocaleString()}
                                        </td>
                                        <td className="px-4 md:px-6 py-3 text-right font-bold text-brand-dark whitespace-nowrap">
                                            ${(Number(item.quantity) * Number(item.unit_cost)).toLocaleString()}
                                        </td>
                                        <td className="px-4 md:px-6 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(item)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setProductionToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Producción"
                message="¿Estás seguro de que deseas eliminar este registro de producción?"
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    );
};

export default Production;
