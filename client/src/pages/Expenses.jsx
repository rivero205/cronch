import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ description: '', amount: '', date: format(new Date(), 'yyyy-MM-dd') });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);

    const { showSuccess, showError } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await api.getExpenses();
            setExpenses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load expenses', error);
            showError('Error al cargar gastos');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setForm({
            description: expense.description,
            amount: expense.amount,
            date: expense.date ? format(new Date(expense.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
        });
    };

    const handleDeleteClick = (expense) => {
        setExpenseToDelete(expense);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!expenseToDelete) return;

        try {
            await api.deleteExpense(expenseToDelete.id);
            showSuccess('Gasto eliminado exitosamente');
            loadData();
        } catch (error) {
            console.error('Failed to delete expense', error);
            showError('Error al eliminar gasto');
        } finally {
            setExpenseToDelete(null);
        }
    };

    const resetForm = () => {
        setForm({ description: '', amount: '', date: format(new Date(), 'yyyy-MM-dd') });
        setEditingExpense(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.description || !form.amount) return;

        try {
            setIsSubmitting(true);

            const payload = {
                description: form.description,
                amount: parseFloat(form.amount),
                date: form.date
            };

            if (editingExpense) {
                await api.updateExpense(editingExpense.id, payload);
                showSuccess('Gasto actualizado exitosamente');
            } else {
                await api.addExpense(payload);
                showSuccess('Gasto agregado exitosamente');
            }

            resetForm();
            loadData();
        } catch (error) {
            console.error('Failed to save expense', error);
            showError('Error al guardar gasto');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-brand-dark">Gestionar Insumos</h2>

            {/* Add/Edit Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-brand-gray uppercase">
                        {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
                    </h3>
                    {editingExpense && (
                        <button
                            onClick={resetForm}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                            Cancelar Edición
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
                        <input
                            type="text"
                            placeholder="Ej: Masa, Aceite"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="w-full md:w-32">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Costo ($)</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold"
                            value={form.amount}
                            onChange={e => setForm({ ...form, amount: e.target.value })}
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="w-full md:w-40">
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
                        className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center whitespace-nowrap ${editingExpense
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-brand-gold hover:bg-opacity-90 text-white'
                            }`}
                    >
                        {isSubmitting ? '...' : (
                            editingExpense ? 'Actualizar' : <><Plus size={20} className="mr-2" /> Agregar</>
                        )}
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <h3 className="text-sm font-medium text-brand-gray p-4 border-b uppercase">Historial Reciente</h3>
                {loading ? (
                    <div className="p-8 text-center text-brand-gray">Cargando...</div>
                ) : expenses.length === 0 ? (
                    <div className="p-8 text-center text-brand-gray">No hay gastos registrados.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[600px]">
                            <thead className="bg-gray-50 text-gray-500 border-b">
                                <tr>
                                    <th className="px-4 md:px-6 py-3 whitespace-nowrap">Fecha</th>
                                    <th className="px-4 md:px-6 py-3 whitespace-nowrap">Descripción</th>
                                    <th className="px-4 md:px-6 py-3 text-right whitespace-nowrap">Costo</th>
                                    <th className="px-4 md:px-6 py-3 text-right whitespace-nowrap">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 md:px-6 py-3 text-brand-gray whitespace-nowrap">
                                            {format(new Date(expense.date), 'dd/MM/yyyy')}
                                        </td>
                                        <td className="px-4 md:px-6 py-3 font-medium text-brand-dark">{expense.description}</td>
                                        <td className="px-4 md:px-6 py-3 text-right font-bold text-brand-dark whitespace-nowrap">
                                            ${Number(expense.amount).toLocaleString()}
                                        </td>
                                        <td className="px-4 md:px-6 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(expense)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(expense)}
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
                    setExpenseToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Gasto"
                message={`¿Estás seguro de que deseas eliminar el gasto "${expenseToDelete?.description}"?`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    );
};

export default Expenses;
