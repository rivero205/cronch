import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Package, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: ''
    });

    const { showSuccess, showError } = useToast();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await api.getProducts();
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading products:', err);
            showError('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            type: product.type
        });
        setShowForm(true);
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;

        try {
            await api.deleteProduct(productToDelete.id);
            showSuccess('Producto eliminado exitosamente');
            fetchProducts();
        } catch (err) {
            showError(err.message || 'Error al eliminar producto');
        } finally {
            setProductToDelete(null);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', type: '' });
        setEditingProduct(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingProduct) {
                await api.updateProduct(editingProduct.id, formData);
                showSuccess('Producto actualizado exitosamente');
            } else {
                await api.createProduct(formData);
                showSuccess('Producto agregado exitosamente');
            }
            resetForm();
            fetchProducts();
        } catch (err) {
            showError(err.message || 'Error al guardar producto');
        }
    };

    if (loading) return <div className="p-4 text-center">Cargando productos...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-brand-dark flex items-center">
                    <Package className="mr-2 text-brand-orange" size={24} />
                    Productos
                </h2>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                    className="bg-brand-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
                >
                    <Plus size={20} className="mr-2" />
                    {showForm ? 'Cancelar' : 'Nuevo Producto'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-brand-dark mb-4">
                        {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre del Producto *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                                placeholder="Ej: Cronch Original"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo *
                            </label>
                            <input
                                type="text"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                                placeholder="Ej: Snack, Bebida, etc."
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors"
                            >
                                {editingProduct ? 'Guardar Cambios' : 'Guardar Producto'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Products List */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-brand-dark mb-4">Lista de Productos</h3>

                {products.length === 0 ? (
                    <p className="text-gray-500 italic">
                        No hay productos registrados. Agrega tu primer producto para empezar.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-brand-dark min-w-[600px]">
                            <thead className="text-xs text-brand-gray uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Nombre</th>
                                    <th className="px-4 py-3">Tipo</th>
                                    <th className="px-4 py-3 text-right rounded-tr-lg">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium">{product.name}</td>
                                        <td className="px-4 py-3">{product.type}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(product)}
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
                    setProductToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Producto"
                message={`¿Estás seguro de que deseas eliminar el producto "${productToDelete?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    );
};

export default Products;
