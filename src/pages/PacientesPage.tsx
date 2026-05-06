import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';

export function PacientesPage() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string; type: 'success'|'error'} | null>(null);
  const [form, setForm] = useState({ codigo: '', nombre: '', fechaNacimiento: '' });

  const loadPacientes = async () => {
    setLoading(true);
    try {
      const data = await api.pacientes.list();
      setPacientes(data);
    } catch (e: any) {
      setToast({ message: `❌ Error: ${e.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPacientes(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codigo || !form.nombre) {
      setToast({ message: '⚠️ Código y nombre son obligatorios', type: 'error' });
      return;
    }
    try {
      await api.pacientes.create(form);
      setToast({ message: '✅ Paciente registrado', type: 'success' });
      setForm({ codigo: '', nombre: '', fechaNacimiento: '' });
      loadPacientes();
    } catch (e: any) {
      setToast({ message: `❌ ${e.message}`, type: 'error' });
    }
  };

  const handleDelete = async (codigo: string) => {
    if (!confirm('¿Dar de baja este paciente?')) return;
    try {
      await api.pacientes.delete(codigo);
      setToast({ message: '🗑️ Paciente dado de baja', type: 'success' });
      loadPacientes();
    } catch (e: any) {
      setToast({ message: `❌ ${e.message}`, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">👥 Gestión de Pacientes</h1>
      
      <Card>
        <h3 className="font-semibold mb-4">Registrar Nuevo Paciente</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-sm font-medium">Código *</label>
            <input required className="w-full mt-1 p-2 border rounded" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} placeholder="Ej: PAC-001" />
          </div>
          <div>
            <label className="text-sm font-medium">Nombre *</label>
            <input required className="w-full mt-1 p-2 border rounded" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Nombre completo" />
          </div>
          <div>
            <label className="text-sm font-medium">Fecha Nacimiento</label>
            <input type="date" className="w-full mt-1 p-2 border rounded" value={form.fechaNacimiento} onChange={e => setForm({...form, fechaNacimiento: e.target.value})} />
          </div>
          <Button type="submit">Registrar</Button>
        </form>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Pacientes Registrados ({pacientes.length})</h3>
        {loading ? <p>Cargando...</p> : pacientes.length === 0 ? (
          <p className="text-slate-500">No hay pacientes registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="p-3 text-left">Código</th><th className="p-3 text-left">Nombre</th><th className="p-3 text-left">Nacimiento</th><th className="p-3">Acción</th></tr></thead>
              <tbody>{pacientes.map((p: any) => (
                <tr key={p.codigo} className="border-t"><td className="p-3 font-medium">{p.codigo}</td><td className="p-3">{p.nombre}</td><td className="p-3">{p.fechaNacimiento?.split('T')[0]}</td>
                <td className="p-3"><Button variant="outline" className="px-2 py-1 text-xs" onClick={() => handleDelete(p.codigo)}>Baja</Button></td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}