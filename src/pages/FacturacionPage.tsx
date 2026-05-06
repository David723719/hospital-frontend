import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import { Calculator, FileText, Download } from 'lucide-react';

export function FacturacionPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string; type: 'success'|'error'} | null>(null);
  const [admisiones, setAdmisiones] = useState<any[]>([]);
  const [tratamientos, setTratamientos] = useState<any[]>([]);

  const TARIFAS = { estanciaDiaria: 150, consulta: 50, tratamiento: 25, examen: 30, medicamento: 15 };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [adms, trats] = await Promise.all([api.admisiones.list().catch(() => []), api.tratamientos.list().catch(() => [])]);
      setAdmisiones(adms.filter((a: any) => a.estado === 'Activo'));
      setTratamientos(trats.filter((t: any) => t.estado === 'Activo'));
    } catch (e: any) { setToast({ message: `❌ Error: ${e.message}`, type: 'error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargarDatos(); }, []);

  const calcularFactura = (admision: any) => {
    const fechaIngreso = new Date(admision.fechaIngreso);
    const fechaEgreso = admision.fechaEgreso ? new Date(admision.fechaEgreso) : new Date();
    const diasEstancia = Math.max(1, Math.ceil((fechaEgreso.getTime() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24)));
    const tratamientosPaciente = tratamientos.filter(t => t.admisionCodigo === admision.codigo);
    const costoEstancia = diasEstancia * TARIFAS.estanciaDiaria;
    const costoTratamientos = tratamientosPaciente.length * TARIFAS.tratamiento;
    const subtotal = costoEstancia + costoTratamientos;
    return { admision, diasEstancia, tratamientosCount: tratamientosPaciente.length, costoEstancia, costoTratamientos, subtotal, impuestos: subtotal * 0.19, total: subtotal * 1.19 };
  };

  const generarFacturaTXT = (factura: any) => {
    const contenido = `FACTURA HOSPITALARIA\n====================\nAdmisión: ${factura.admision.codigo}\nPaciente: ${factura.admision.pacienteCodigo}\nCama: ${factura.admision.camaCodigo}\n\nDETALLE:\n- Estancia (${factura.diasEstancia} días): $${factura.costoEstancia.toFixed(2)}\n- Tratamientos (${factura.tratamientosCount}): $${factura.costoTratamientos.toFixed(2)}\n\nSUBTOTAL: $${factura.subtotal.toFixed(2)}\nIVA (19%): $${factura.impuestos.toFixed(2)}\nTOTAL: $${factura.total.toFixed(2)}`;
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Factura-${factura.admision.codigo}.txt`; a.click();
    URL.revokeObjectURL(url);
    setToast({ message: '✅ Factura descargada', type: 'success' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">💰 Facturación Automática</h1>
        <Button onClick={cargarDatos} disabled={loading}>{loading ? 'Cargando...' : '🔄 Actualizar'}</Button>
      </div>
      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><FileText className="w-5 h-5" /> Admisiones Activas</h3>
        {loading ? <p className="text-slate-500">Cargando...</p> : admisiones.length === 0 ? <p className="text-slate-500">No hay admisiones activas</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="p-3 text-left">Admisión</th><th className="p-3 text-left">Paciente</th><th className="p-3 text-left">Días</th><th className="p-3 text-right">Total Estimado</th><th className="p-3">Acción</th></tr></thead>
              <tbody>{admisiones.map((a: any) => { const f = calcularFactura(a); return (
                <tr key={a.codigo} className="border-t hover:bg-slate-50">
                  <td className="p-3 font-medium">{a.codigo}</td><td className="p-3">{a.pacienteCodigo}</td><td className="p-3">{f.diasEstancia} días</td>
                  <td className="p-3 text-right font-bold text-green-600">${f.total.toFixed(2)}</td>
                  <td className="p-3 text-right"><Button variant="outline" className="px-3 py-1 text-xs" onClick={() => generarFacturaTXT(f)}><Download className="w-4 h-4" /></Button></td>
                </tr>); })}</tbody>
            </table>
          </div>
        )}
      </Card>
      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Calculator className="w-5 h-5" /> Tarifas Base</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between p-2 bg-slate-50 rounded"><span>Estancia diaria:</span><span className="font-medium">${TARIFAS.estanciaDiaria}</span></div>
          <div className="flex justify-between p-2 bg-slate-50 rounded"><span>Tratamiento:</span><span className="font-medium">${TARIFAS.tratamiento}</span></div>
          <div className="flex justify-between p-2 bg-slate-50 rounded"><span>Impuestos (IVA):</span><span className="font-medium">19%</span></div>
        </div>
      </Card>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}