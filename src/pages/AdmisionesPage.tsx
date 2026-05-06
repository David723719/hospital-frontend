import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';

export function AdmisionesPage() {
  const [admisiones, setAdmisiones] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [camas, setCamas] = useState<any[]>([]);
  const [mensajeCamas, setMensajeCamas] = useState('');
  const [mostrarMensajeCamas, setMostrarMensajeCamas] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string; type: 'success'|'error'} | null>(null);
  const [form, setForm] = useState({ codigo: '', pacienteCodigo: '', camaCodigo: '', fechaIngreso: '', especialidad: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [a, p, c] = await Promise.all([api.admisiones.list(), api.pacientes.list(), api.camas.disponibles()]);
      setAdmisiones(a); setPacientes(p); setCamas(c);
      if (c.length === 0) {
        setMensajeCamas('');
      } else if (mostrarMensajeCamas) {
        const lista = c.map((x: any) => x.codigo).join(', ');
        setMensajeCamas(`Se te asignaron estas camas: ${lista}`);
      }
    } catch (e: any) { setToast({ message: `❌ Error: ${e.message}`, type: 'error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codigo || !form.pacienteCodigo || !form.camaCodigo) {
      setToast({ message: '⚠️ Todos los campos son obligatorios', type: 'error' });
      return;
    }
    try {
      await api.admisiones.create(form);
      setToast({ message: '✅ Admisión registrada', type: 'success' });
      setMensajeCamas('');
      setMostrarMensajeCamas(false);
      setForm({ codigo: '', pacienteCodigo: '', camaCodigo: '', fechaIngreso: '', especialidad: '' });
      load();
    } catch (e: any) {
      setToast({ message: `❌ ${e.message}`, type: 'error' });
    }
  };

  const handleAlta = async (codigo: string) => {
    if (!confirm('¿Confirmar alta médica?')) return;
    try {
      await api.admisiones.delete(codigo);
      setToast({ message: '✅ Alta realizada', type: 'success' });
      load();
    } catch (e: any) { setToast({ message: `❌ ${e.message}`, type: 'error' }); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">📋 Gestión de Admisiones</h1>
      {mensajeCamas && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          {mensajeCamas}
        </div>
      )}
      
      <Card>
        <h3 className="font-semibold mb-4">Nueva Admisión</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><label className="text-sm font-medium">Código *</label><input required title="Código de admisión" className="w-full mt-1 p-2 border rounded" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} placeholder="ADM-001" /></div>
          <div><label className="text-sm font-medium">Paciente *</label><select required title="Paciente" className="w-full mt-1 p-2 border rounded" value={form.pacienteCodigo} onChange={e => setForm({...form, pacienteCodigo: e.target.value})}><option value="">Seleccionar...</option>{pacientes.map((p: any) => <option key={p.codigo} value={p.codigo}>{p.nombre}</option>)}</select></div>
          <div><label className="text-sm font-medium">Cama Disponible *</label><select required title="Cama disponible" className="w-full mt-1 p-2 border rounded" value={form.camaCodigo} onChange={e => setForm({...form, camaCodigo: e.target.value})}><option value="">Seleccionar...</option>{camas.map((c: any) => <option key={c.codigo} value={c.codigo}>{c.codigo} ({c.unidad})</option>)}</select></div>
          <div><label className="text-sm font-medium">Fecha Ingreso</label><input type="datetime-local" title="Fecha de ingreso" className="w-full mt-1 p-2 border rounded" value={form.fechaIngreso} onChange={e => setForm({...form, fechaIngreso: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Especialidad</label><input className="w-full mt-1 p-2 border rounded" value={form.especialidad} onChange={e => setForm({...form, especialidad: e.target.value})} placeholder="Ej: Cardiología" /></div>
          <div className="flex items-end"><Button type="submit" className="w-full">Registrar</Button></div>
        </form>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Admisiones Activas ({admisiones.length})</h3>
        {loading ? <p>Cargando...</p> : admisiones.length === 0 ? <p className="text-slate-500">No hay admisiones.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="p-3 text-left">Admisión</th><th className="p-3 text-left">Paciente</th><th className="p-3 text-left">Cama</th><th className="p-3 text-left">Ingreso</th><th className="p-3 text-left">Especialidad</th><th className="p-3">Acción</th></tr></thead>
              <tbody>{admisiones.map((a: any) => (
                <tr key={a.codigo} className="border-t"><td className="p-3 font-medium">{a.codigo}</td><td className="p-3">{a.pacienteCodigo}</td><td className="p-3">{a.camaCodigo}</td><td className="p-3">{a.fechaIngreso?.split('T')[0]}</td><td className="p-3">{a.especialidad}</td>
                <td className="p-3"><Button variant="outline" className="px-2 py-1 text-xs" onClick={() => handleAlta(a.codigo)}>Alta</Button></td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}