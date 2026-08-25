import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Sparkles, User, LogOut, LayoutDashboard, QrCode } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

interface NavbarProps {
  onOpenCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart }) => {
  const { user, logout } = useAuthStore();
  const totalCartItems = useCartStore((s) => s.getTotalItems());
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-teal-200 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
                Santa Cruz Essence
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                Perfumería & Alta Gala
              </span>
            </div>
          </Link>

          {/* Acciones */}
          <div className="flex items-center gap-4">
            {/* Botón Carrito para el catálogo */}
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="relative p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all hover:border-teal-500/50 group"
                title="Ver Carrito"
              >
                <ShoppingBag className="w-5 h-5 group-hover:text-teal-400 transition-colors" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {totalCartItems}
                  </span>
                )}
              </button>
            )}

            {/* Estado de Sesión */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={user.rol === 'ADMIN' ? '/admin' : '/vendedor'}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-900/40 to-slate-900 border border-teal-500/30 hover:border-teal-400/60 text-teal-300 text-sm font-medium transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.nombre} ({user.rol})</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/50 text-slate-400 hover:text-red-400 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-600/20 transition-all"
              >
                <User className="w-4 h-4" />
                <span>Ingresar</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
