import React from 'react';
import { createPortal } from 'react-dom';
import { Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmailConfirmationModal = ({ isOpen, email, onClose }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all scale-100">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
                        <Clock className="text-yellow-600" size={40} />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        ¡Registro Exitoso!
                    </h3>

                    <p className="text-gray-600 mb-4 leading-relaxed">
                        Tu cuenta ha sido creada y está <span className="font-semibold text-yellow-600">pendiente de aprobación</span>.
                    </p>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                            Próximos pasos:
                        </p>
                        <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                            <li>Un administrador revisará tu solicitud</li>
                            <li>Recibirás un email cuando seas aprobado</li>
                            <li>Deberás confirmar tu correo electrónico</li>
                            <li>Podrás acceder al sistema</li>
                        </ol>
                    </div>

                    <p className="text-xs text-gray-500 mb-6">
                        Este proceso puede tomar algunas horas. Te notificaremos por email.
                    </p>

                    <div className="space-y-3">
                        <Link
                            to="/login"
                            className="block w-full py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200/50"
                        >
                            Entendido
                        </Link>

                        {onClose && (
                            <button
                                onClick={onClose}
                                className="block w-full py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                            >
                                Cerrar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default EmailConfirmationModal;
