import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ description: '', amount: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await api.getExpenses();
            setExpenses(data);
        } catch (error) {
            console.error('Failed to load expenses', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.description || !form.amount) return;

        try {
            setIsSubmitting(true);
            await api.addExpense({
                description: form.description,
                amount: parseFloat(form.amount),
                date: format(new Date(), 'yyyy-MM-dd')
            });
            setForm({ description: '', amount: '' });
            loadData(); // Reload list
        } catch (error) {
            console.error('Failed to add expense', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-brand-dark">Gestionar Insumos</h2>

            {/* Add Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-brand-gray mb-4 uppercase">Nuevo Gasto</h3>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Descripción (ej. Masa, Aceite)"
                        className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Costo Total ($)"
                        className="w-full md:w-40 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold"
                        value={form.amount}
                        onChange={e => setForm({ ...form, amount: e.target.value })}
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
                ) : expenses.length === 0 ? (
                    <div className="p-8 text-center text-brand-gray">No hay gastos registrados hoy.</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Descripción</th>
                                <th className="px-6 py-3 text-right">Costo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {expenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 text-brand-gray">
                                        {format(new Date(expense.date), 'dd/MM/yyyy')}
                                    </td>
                                    <td className="px-6 py-3 font-medium text-brand-dark">{expense.description}</td>
                                    <td className="px-6 py-3 text-right font-bold text-brand-dark">
                                        ${Number(expense.amount).toLocaleString()}
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

export default Expenses;
