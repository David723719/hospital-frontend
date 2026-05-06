import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';

export function CamasPage() {
  const [camas, setCamas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState({ codigo: '', unidad: 'General', tipo: 'Estándar' });

  useEffect(() => { loadCamas(); }, []);

  const loadCamas = async () => {
    setLoading(true);
    try {
      const data = await api.camas.list();
      setCamas(data);
    } catch (e: any) {
      setToast({ message: 'Error al cargar', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codigo) {
      setToast({ message: 'Código obligatorio', type: 'error' });
      return;
    }
    try {
      await api.camas.create(form);
      setToast({ message: 'Cama registrada', type: 'success' });
      setForm({ codigo: '', unidad: 'General', tipo: 'Estándar' });
      loadCamas();
    } catch (e: any) {
      setToast({ message: e.message, type: 'error' });
    }
  };

  const toggleEstado = async (codigo: string, actual: string) => {
    const nuevo = actual === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      await api.camas.cambiarEstado(codigo, nuevo);
      setToast({ message: `Estado: ${nuevo}`, type: 'success' });
      loadCamas();
    } catch (e: any) {
      setToast({ message: e.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Camas</h1>
      <Card>
        <form onSubmit={handleSubmit} className="flex gap-4 flex-wrap">
          <input className="border p-2 rounded" placeholder="Código *" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
          <select className="border p-2 rounded" value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })}>
            <option>General</option><option>UCI</option>
          </select>
          <select className="border p-2 rounded" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            <option>Estándar</option><option>Eléctrica</option>
          </select>
          <Button type="submit">Registrar</Button>
        </form>
      </Card>
      <Card>
        {loading ? <p>Cargando...</p> : camas.length === 0 ? <p>Sin camas</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {camas.map((c: any) => (
              <div key={c.codigo} className="border p-4 rounded flex justify-between items-center">
                <div><p className="font-bold">{c.codigo}</p><p className="text-sm text-gray-500">{c.unidad} - {c.tipo}</p></div>
                <button onClick={() => toggleEstado(c.codigo, c.estado)} className={`px-3 py-1 rounded text-sm ${c.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{c.estado}</button>
              </div>
            ))}
          </div>
        )}
      </Card>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}