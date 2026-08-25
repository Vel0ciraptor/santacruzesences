import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ShoppingBag, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { api } from '../../services/api';
import { Navbar } from '../../components/Navbar';

export const CheckoutPage: React.FC = () => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const [pedidoCompletado, setPedidoCompletado] = useState<{ id: string; waUrl: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '59168919448';
  const cleanWaNumber = whatsappNumber.replace(/[^0-9]/g, '');

  if (items.length === 0 && !pedidoCompletado) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md glass-panel p-8 rounded-3xl border border-slate-800">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-200">Tu carrito está vacío</h2>
            <p className="text-xs text-slate-400 mt-2 mb-6">No tienes productos seleccionados para procesar un pedido.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Catálogo</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirmarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const total = getTotalPrice();
    const itemsJson = items.map((i) => ({
      productoId: i.producto.id,
      nombre: i.producto.nombre,
      cantidad: i.cantidad,
      precio: Number(i.producto.precio),
    }));

    try {
      // 1. Crear Pedido en backend
      const res = await api.post('/pedidos', {
        nombreClienteTexto: nombre,
        telefonoTexto: telefono || null,
        items: itemsJson,
        total,
      });

      const pedidoId = res.data.id;

      // 2. Construir mensaje de WhatsApp
      let textMsg = `*¡Hola Santa Cruz Essence!* 👋✨\nQuiero realizar el siguiente pedido:\n\n`;
      textMsg += `📌 *Pedido ID:* #${pedidoId.substring(0, 8)}\n`;
      textMsg += `👤 *Cliente:* ${nombre}\n`;
      if (telefono) textMsg += `📱 *Teléfono:* ${telefono}\n`;
      textMsg += `\n🛍️ *Detalle del Pedido:*\n`;

      items.forEach((item) => {
        textMsg += `• ${item.cantidad}x ${item.producto.nombre} (${item.producto.marca || 'Esencia'}) — Bs. ${(Number(item.producto.precio) * item.cantidad).toFixed(2)}\n`;
      });

      textMsg += `\n💰 *TOTAL A PAGAR:* Bs. ${total.toFixed(2)}\n\n`;
      textMsg += `Quedo a la espera de la confirmación de stock y métodos de pago. ¡Gracias!`;

      const encodedMsg = encodeURIComponent(textMsg);
      const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodedMsg}`;

      // 3. Limpiar carrito y mostrar pantalla de éxito con redirección
      clearCart();
      setPedidoCompletado({ id: pedidoId, waUrl });

      // Abrir enlace de WhatsApp en pestaña nueva automáticamente
      window.open(waUrl, '_blank');
    } catch (err: any) {
      console.error('Error al registrar pedido:', err);
      setErrorMsg(err.response?.data?.message || 'Error al procesar pedido. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-teal-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>

        {pedidoCompletado ? (
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-teal-500/30 text-center max-w-xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">¡Pedido Registrado con Éxito!</h2>
            <p className="text-xs text-slate-400 mt-2">
              Se ha asignado el código de seguimiento <strong className="text-teal-300">#{pedidoCompletado.id.substring(0, 8)}</strong>
            </p>

            <div className="mt-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <MessageSquare className="w-4 h-4" />
                <span>Redirigiendo a WhatsApp</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Si la ventana de WhatsApp no se abrió automáticamente, haz clic en el siguiente botón para enviar los detalles de tu pedido a nuestro vendedor autorizado.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={pedidoCompletado.waUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Abrir WhatsApp Ahora</span>
              </a>
              <Link
                to="/"
                className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 text-sm font-semibold transition-colors"
              >
                Seguir Comprando
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Formulario Datos de Envío/Contacto */}
            <div className="lg:col-span-7 space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <h2 className="text-lg font-bold text-slate-100 mb-1">Tus Datos de Contacto</h2>
                <p className="text-xs text-slate-400 mb-6">
                  Ingresa tus datos para registrar la reserva y generar el resumen para WhatsApp.
                </p>

                {errorMsg && (
                  <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleConfirmarPedido} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Maria Gutierrez"
                      className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                      Teléfono / WhatsApp (Opcional)
                    </label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej. 71234567"
                      className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Procesando...</span>
                      ) : (
                        <>
                          <MessageSquare className="w-5 h-5" />
                          <span>Enviar Pedido por WhatsApp</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Resumen del Carrito */}
            <div className="lg:col-span-5">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
                  Resumen de Compra
                </h3>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {items.map(({ producto, cantidad }) => (
                    <div key={producto.id} className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-slate-200">{producto.nombre}</p>
                        <p className="text-slate-500">{cantidad} x Bs. {Number(producto.precio).toFixed(2)}</p>
                      </div>
                      <span className="font-bold text-slate-300">
                        Bs. {(Number(producto.precio) * cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Atención de Pedidos:</span>
                    <span className="text-teal-400 font-semibold">+591 68919448</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2">
                    <span className="font-bold text-slate-200">TOTAL:</span>
                    <span className="text-xl font-extrabold text-emerald-400">
                      Bs. {getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
