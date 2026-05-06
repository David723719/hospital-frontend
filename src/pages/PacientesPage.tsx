import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';

export function PacientesPage() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState({ codigo: '', nombre: '', fechaNacimiento: '' });

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { setPacientes(await api.pacientes.list()); }
    catch (e: any) { setToast({ message: 'Error', type: 'error' }); }
    finally { setLoading(false); }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codigo || !form.nombre) { setToast({ message: 'Campos obligatorios', type: 'error' }); return; }
    try {
      await api.pacientes.create(form);
      setToast({ message: 'Registrado', type: 'success' });
      setForm({ codigo: '', nombre: '', fechaNacimiento: '' });
      load();
    } catch (e: any) { setToast({ message: e.message, type: 'error' }); }
  };
  const handleDelete = async (codigo: string) => {
    if (!confirm('¿Dar de baja?')) return;
    try { await api.pacientes.delete(codigo); setToast({ message: 'Dado de baja', type: 'success' }); load(); }
    catch (e: any) { setToast({ message: e.message, type: 'error' }); }
  };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pacientes</h1>
      <Card>
        <form onSubmit={handleSubmit} className="flex gap-4 flex-wrap">
          <input className="border p-2 rounded" placeholder="Código *" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <input type="date" className="border p-2 rounded" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} />
          <Button type="submit">Registrar</Button>
        </form>
      </Card>
      <Card>
        {loading ? <p>Cargando...</p> : pacientes.length === 0 ? <p>Sin pacientes</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="p-3 text-left">Código</th><th className="p-3 text-left">Nombre</th><th className="p-3">Acción</th></tr></thead>
              <tbody>{pacientes.map((p: any) => (<tr key={p.codigo} className="border-t"><td className="p-3">{p.codigo}</td><td className="p-3">{p.nombre}</td><td className="p-3"><Button variant="outline" className="text-xs" onClick={() => handleDelete(p.codigo)}>Baja</Button></td></tr>))}</tbody>
            </table>
          </div>
        )}
      </Card>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}