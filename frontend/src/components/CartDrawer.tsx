import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel border-l border-slate-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold text-slate-100">Tu Carrito de Perfumes</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-600 stroke-1" />
                <p className="font-medium text-sm">Tu carrito está vacío</p>
                <p className="text-xs text-slate-500 mt-1">Explora nuestro catálogo y agrega tus fragancias favoritas.</p>
              </div>
            ) : (
              items.map(({ producto, cantidad }) => (
                <div
                  key={producto.id}
                  className="flex items-center gap-4 p-3 rounded-2xl glass-card border border-slate-800"
                >
                  <img
                    src={producto.imagenUrl}
                    alt={producto.nombre}
                    className="w-16 h-16 object-cover rounded-xl bg-slate-900 border border-slate-800 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=300');
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-teal-400 uppercase tracking-wider">{producto.marca || 'Santa Cruz'}</p>
                    <h3 className="text-sm font-semibold text-slate-100 truncate">{producto.nombre}</h3>
                    <p className="text-sm font-bold text-emerald-400 mt-0.5">Bs. {Number(producto.precio).toFixed(2)}</p>

                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900">
                        <button
                          onClick={() => updateQuantity(producto.id, cantidad - 1)}
                          className="p-1 hover:text-teal-400 text-slate-400 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-200">{cantidad}</span>
                        <button
                          onClick={() => updateQuantity(producto.id, cantidad + 1)}
                          className="p-1 hover:text-teal-400 text-slate-400 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(producto.id)}
                        className="text-slate-500 hover:text-red-400 text-xs transition-colors p-1"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-950/90 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Subtotal Estimado:</span>
                <span className="text-xl font-extrabold text-emerald-400">
                  Bs. {getTotalPrice().toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="px-3 py-3 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors"
                >
                  Vaciar
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Procesar Pedido</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
