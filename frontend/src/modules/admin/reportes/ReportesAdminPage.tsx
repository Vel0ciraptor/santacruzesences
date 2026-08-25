import React, { useState } from 'react';
import { SidebarAdmin } from '@/components/SidebarAdmin';
import {
  FileSpreadsheet,
  Download,
  ShoppingBag,
  Boxes,
  Users,
  Database,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileDown,
} from 'lucide-react';
import { api } from '@/services/api';

export const ReportesAdminPage: React.FC = () => {
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState<any>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const downloadExcel = (endpoint: string, filename: string) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('accessToken');

    fetch(`${API_URL}/reportes/export/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => console.error(err));
  };

  const handleExportBackupJson = async () => {
    try {
      setBackupLoading(true);
      const res = await api.get('/reportes/backup/export');
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `backup-santacruz-essence-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      alert('Error al generar la copia de seguridad: ' + (err.response?.data?.message || err.message));
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackupJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    const confirmRestore = window.confirm(
      '¿Estás seguro de restaurar/sincronizar esta copia de seguridad? Se integrarán y actualizarán los registros correspondientes.'
    );
    if (!confirmRestore) {
      e.target.value = '';
      return;
    }

    setRestoreLoading(true);
    setRestoreError(null);
    setRestoreSuccess(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await api.post('/reportes/backup/restore', json);
        setRestoreSuccess(res.data);
      } catch (err: any) {
        setRestoreError(err.response?.data?.message || 'Error al restaurar archivo de copia de seguridad.');
      } finally {
        setRestoreLoading(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarAdmin />

      <main className="flex-1 p-8 overflow-y-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-100">Exportación de Reportes & Respaldos</h1>
          <p className="text-xs text-slate-400 mt-1">
            Descarga directamente las sábanas de datos en formato Excel (.xlsx) o genera copias completas de la base de datos.
          </p>
        </div>

        {/* Sección Excel */}
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Reportes en Excel (.xlsx)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-100 text-base">Reporte de Ventas</h3>
              <p className="text-xs text-slate-400 mt-1">
                Detalle item por item de todas las ventas, vendedores, precios y totales.
              </p>
            </div>
            <button
              onClick={() => downloadExcel('ventas', 'reporte-ventas')}
              className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Ventas .xlsx</span>
            </button>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-100 text-base">Reporte de Stock</h3>
              <p className="text-xs text-slate-400 mt-1">
                Estado de inventario por SKU, stock mínimo, alertas y precios de venta.
              </p>
            </div>
            <button
              onClick={() => downloadExcel('stock', 'reporte-stock')}
              className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-teal-400 hover:text-teal-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Stock .xlsx</span>
            </button>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-100 text-base">Reporte de Clientes</h3>
              <p className="text-xs text-slate-400 mt-1">
                Base CRM de clientes con número de compras y datos de contacto registrados.
              </p>
            </div>
            <button
              onClick={() => downloadExcel('clientes', 'reporte-clientes')}
              className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 hover:text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Clientes .xlsx</span>
            </button>
          </div>
        </div>

        {/* Sección Copias de Seguridad JSON */}
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-400" />
          <span>Copia de Seguridad del Sistema (Backup Total)</span>
        </h2>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">Exportar e Importar Copia de Seguridad JSON</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Permite exportar todos los datos (productos, stocks, clientes, vendedores y configuración) en un archivo JSON portátil para migrar a producción o guardar respaldos periódicos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportBackupJson}
                disabled={backupLoading}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
              >
                <FileDown className="w-4 h-4" />
                <span>{backupLoading ? 'Generando...' : 'Descargar Backup Completo'}</span>
              </button>

              <input
                type="file"
                accept=".json"
                onChange={handleRestoreBackupJson}
                className="hidden"
                id="restoreJsonInput"
              />
              <label
                htmlFor="restoreJsonInput"
                className={`px-4 py-2.5 rounded-xl bg-slate-900 border border-purple-500/40 hover:bg-purple-950/30 text-purple-300 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
                  restoreLoading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>{restoreLoading ? 'Restaurando...' : 'Restaurar / Importar Backup'}</span>
              </label>
            </div>
          </div>

          {restoreSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <div>
                <p className="font-bold text-slate-100">{restoreSuccess.mensaje}</p>
                <p className="text-[11px] text-emerald-300/80 mt-0.5">
                  Productos procesados: {restoreSuccess.productosRestaurados} | Clientes: {restoreSuccess.clientesRestaurados} | Premios: {restoreSuccess.premiosRestaurados}
                </p>
              </div>
            </div>
          )}

          {restoreError && (
            <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
              <span>{restoreError}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
