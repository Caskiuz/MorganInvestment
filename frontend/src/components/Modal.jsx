import React from "react";
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 flex items-start sm:items-center justify-center pt-24 sm:pt-0 bg-black/40 backdrop-blur-sm animate-fadeIn overflow-auto" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full relative animate-fadeInUp max-h-[90vh] overflow-auto mx-4 sm:mx-0">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl font-bold transition"
          onClick={onClose}
          aria-label="Cerrar"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
};

export default Modal;
