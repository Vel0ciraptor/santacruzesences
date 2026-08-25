import React, { useState, useEffect, useRef } from 'react';
import { SidebarVendedor } from '@/components/SidebarVendedor';
import { QrCode, Camera, ShoppingBag, AlertCircle, RefreshCcw, ArrowRight } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '@/services/api';
import { Producto } from '@/types';
import { useNavigate } from 'react-router-dom';

export const EscanerQrPage: React.FC = () => {
  const [scannedSku, setScannedSku] = useState<string | null>(null);
  const [producto, setProducto] = useState<Producto | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const navigate = useNavigate();

  const startScanner = async () => {
    setErrorMsg(null);
    setProducto(null);
    setScannedSku(null);

    try {
      const qrScanner = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {}
      );
      setIsScanning(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('No se pudo acceder a la cámara. Asegúrate de otorgar permisos de cámara e ingresar por HTTPS en producción.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.error(e);
      }
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleScanSuccess = async (skuText: string) => {
    await stopScanner();
    setScannedSku(skuText);
    fetchProducto(skuText);
  };

  const fetchProducto = async (sku: string) => {
    setErrorMsg(null);
    try {
      const res = await api.get(`/productos/sku/${sku}`);
      setProducto(res.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || `No se encontró producto con SKU: ${sku}`);
    }
  };

  const handleVenderDirecto = () => {
    if (producto) {
      navigate('/vendedor/ventas/nueva', { state: { preselectedProducto: producto } });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarVendedor />

      <main className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-slate-100">Escáner QR de Fragancias</h1>
          <p className="text-xs text-slate-400 mt-1">
            Apunta la cámara al código QR impreso en el producto para verificar stock o registrar venta.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center">
            <div
              id="qr-reader"
              className="w-full aspect-square max-w-sm rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative mb-4"
            />

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs text-left w-full">
                {errorMsg}
              </div>
            )}

            {!isScanning ? (
              <button
                onClick={startScanner}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Activar Cámara Escáner</span>
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="w-full py-3.5 rounded-xl bg-red-950 border border-red-500/40 text-red-300 font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>Detener Cámara</span>
              </button>
            )}
          </div>

          <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
            {producto ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <QrCode className="w-4 h-4" />
                  <span>¡Código QR Detectado!</span>
                </div>

                <div className="flex gap-4 items-center">
                  <img
                    src={producto.imagenUrl}
                    alt={producto.nombre}
                    className="w-24 h-24 object-cover rounded-2xl bg-slate-900 border border-slate-800"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=300');
                    }}
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-400">{producto.marca || 'Santa Cruz'}</span>
                    <h3 className="text-lg font-bold text-slate-100">{producto.nombre}</h3>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">SKU: {producto.sku}</p>
                    <p className="text-xl font-extrabold text-emerald-400 mt-2">
                      Bs. {Number(producto.precio).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Stock Disponible:</span>
                  <span className="font-bold text-slate-200 text-sm">{producto.stock?.cantidad ?? 0} unidades</span>
                </div>

                <button
                  onClick={handleVenderDirecto}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Cargar Producto a Nueva Venta</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <QrCode className="w-16 h-16 mb-3 stroke-1 text-slate-600" />
                <p className="text-sm font-semibold text-slate-300">Esperando Lectura</p>
                <p className="text-xs text-slate-500 mt-1">
                  Cuando la cámara lea un QR, los detalles del perfume aparecerán aquí automáticamente.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
