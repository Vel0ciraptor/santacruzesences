import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  QrCode,
  ShoppingCart,
  ShoppingBag,
  UserCheck,
  Disc,
  LogOut,
  Sparkles,
  Store,
  Home,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const SidebarVendedor: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Inicio Vendedor', path: '/vendedor', icon: Home, end: true },
    { label: 'Escáner QR', path: '/vendedor/escaner', icon: QrCode },
    { label: 'Registrar Venta', path: '/vendedor/ventas/nueva', icon: ShoppingCart },
    { label: 'Pedidos Entrantes', path: '/vendedor/pedidos', icon: ShoppingBag },
    { label: 'Clientes CRM', path: '/vendedor/clientes', icon: UserCheck },
    { label: 'Ruleta Sorteo Live', path: '/vendedor/ruleta', icon: Disc },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 min-h-screen flex flex-col justify-between p-4 sticky top-0 h-screen overflow-y-auto">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center font-bold text-slate-950">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-100 block">Santa Cruz Essence</span>
            <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">Módulo Vendedor</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950 to-teal-900/40 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-900/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 text-sm font-medium transition-all"
        >
          <Store className="w-4 h-4 text-emerald-400" />
          <span>Ver Catálogo Público</span>
        </NavLink>

        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="truncate mr-2">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.nombre}</p>
            <p className="text-[10px] text-slate-500 truncate">Vendedor Autorizado</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-1.5 hover:bg-red-950/50 hover:text-red-400 text-slate-400 rounded-lg transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
