import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';

export function TratamientosPage() {
  const [tratamientos, setTratamientos] = useState<any[]>([]);
  const [admisiones, setAdmisiones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string; type: 'success'|'error'} | null>(null);
  const [form, setForm] = useState({ codigo: '', admisionCodigo: '', nombreMedicamento: '', dosis: '', duracionDias: 5 });

  const load = async () => {
    setLoading(true);
    try {
      const [t, a] = await Promise.all([api.tratamientos.list(), api.admisiones.list()]);
      setTratamientos(t);
      setAdmisiones(a.filter((x: any) => x.estado !== 'Inactivo'));
    } catch (e: any) { setToast({ message: `❌ Error: ${e.message}`, type: 'error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codigo || !form.admisionCodigo || !form.nombreMedicamento) {
      setToast({ message: '⚠️ Campos obligatorios faltantes', type: 'error' });
      return;
    }
    try {
      await api.tratamientos.create({ ...form, fechaInicio: new Date().toISOString() });
      setToast({ message: '✅ Tratamiento asignado', type: 'success' });
      setForm({ codigo: '', admisionCodigo: '', nombreMedicamento: '', dosis: '', duracionDias: 5 });
      load();
    } catch (e: any) { setToast({ message: `❌ ${e.message}`, type: 'error' }); }
  };

  const handleDelete = async (codigo: string) => {
    if (!confirm('¿Suspender tratamiento?')) return;
    try {
      await api.tratamientos.delete(codigo);
      setToast({ message: '🗑️ Tratamiento suspendido', type: 'success' });
      load();
    } catch (e: any) { setToast({ message: `❌ ${e.message}`, type: 'error' }); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">💊 Gestión de Tratamientos</h1>
      
      <Card>
        <h3 className="font-semibold mb-4">Asignar Nuevo Tratamiento</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><label className="text-sm font-medium">Código *</label><input required className="w-full mt-1 p-2 border rounded" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} placeholder="TRAT-001" /></div>
          <div><label className="text-sm font-medium">Admisión *</label><select required className="w-full mt-1 p-2 border rounded" value={form.admisionCodigo} onChange={e => setForm({...form, admisionCodigo: e.target.value})}><option value="">Seleccionar...</option>{admisiones.map((a: any) => <option key={a.codigo} value={a.codigo}>{a.codigo} - {a.pacienteCodigo}</option>)}</select></div>
          <div><label className="text-sm font-medium">Medicamento *</label><input required className="w-full mt-1 p-2 border rounded" value={form.nombreMedicamento} onChange={e => setForm({...form, nombreMedicamento: e.target.value})} placeholder="Ej: Paracetamol" /></div>
          <div><label className="text-sm font-medium">Dosis *</label><input required className="w-full mt-1 p-2 border rounded" value={form.dosis} onChange={e => setForm({...form, dosis: e.target.value})} placeholder="1 cada 8h" /></div>
          <div><label className="text-sm font-medium">Días</label><input type="number" min="1" className="w-full mt-1 p-2 border rounded" value={form.duracionDias} onChange={e => setForm({...form, duracionDias: parseInt(e.target.value) || 1})} /></div>
          <div className="flex items-end"><Button type="submit" className="w-full">Asignar</Button></div>
        </form>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Tratamientos Activos ({tratamientos.length})</h3>
        {loading ? <p>Cargando...</p> : tratamientos.length === 0 ? <p className="text-slate-500">No hay tratamientos.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="p-3 text-left">Código</th><th className="p-3 text-left">Admisión</th><th className="p-3 text-left">Medicamento</th><th className="p-3 text-left">Dosis</th><th className="p-3 text-left">Días</th><th className="p-3">Acción</th></tr></thead>
              <tbody>{tratamientos.map((t: any) => (
                <tr key={t.codigo} className="border-t"><td className="p-3 font-medium">{t.codigo}</td><td className="p-3">{t.admisionCodigo}</td><td className="p-3">{t.nombreMedicamento}</td><td className="p-3">{t.dosis}</td><td className="p-3">{t.duracionDias}</td>
                <td className="p-3"><Button variant="outline" className="px-2 py-1 text-xs" onClick={() => handleDelete(t.codigo)}>Suspender</Button></td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}