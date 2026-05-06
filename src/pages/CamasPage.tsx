import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';

export function CamasPage() {
  const [camas, setCamas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string; type: 'success'|'error'} | null>(null);
  const [form, setForm] = useState({ codigo: '', unidad: 'General', tipo: 'Estándar' });

  const loadCamas = async () => {
    setLoading(true);
    try {
      const data = await api.camas.list();
      setCamas(data);
    } catch (e: any) {
      setToast({ message: `❌ Error: ${e.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCamas(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codigo) {
      setToast({ message: '⚠️ El código es obligatorio', type: 'error' });
      return;
    }
    try {
      await api.camas.create(form);
      setToast({ message: '✅ Cama registrada', type: 'success' });
      setForm({ codigo: '', unidad: 'General', tipo: 'Estándar' });
      loadCamas();
    } catch (e: any) {
      setToast({ message: `❌ ${e.message}`, type: 'error' });
    }
  };

  const cambiarEstado = async (c: any) => {
    const nuevo = c.estadoOperativo === 'Disponible' ? 'Ocupada' : 'Disponible';
    try {
      await api.camas.cambiarEstado(c.codigo, nuevo);
      setToast({ message: `Estado: ${nuevo}`, type: 'success' });
      loadCamas();
    } catch (e: any) {
      setToast({ message: `❌ ${e.message}`, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🛏️ Gestión de Camas</h1>
      
      <Card>
        <h3 className="font-semibold mb-4">Registrar Nueva Cama</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div><label className="text-sm font-medium">Código *</label><input required className="w-full mt-1 p-2 border rounded" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} placeholder="CAM-101" /></div>
          <div><label className="text-sm font-medium">Unidad</label><select className="w-full mt-1 p-2 border rounded" value={form.unidad} onChange={e => setForm({...form, unidad: e.target.value})}><option>General</option><option>UCI</option><option>Pediatría</option></select></div>
          <div><label className="text-sm font-medium">Tipo</label><select className="w-full mt-1 p-2 border rounded" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}><option>Estándar</option><option>Eléctrica</option><option>Crítica</option></select></div>
          <Button type="submit">Registrar</Button>
        </form>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Camas Registradas ({camas.length})</h3>
        {loading && camas.length === 0 ? <p>Cargando...</p> : camas.length === 0 ? <p className="text-slate-500">No hay camas registradas.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {camas.map((c: any) => (
              <div key={c.codigo} className="border p-4 rounded-lg bg-white flex justify-between items-center">
                <div><p className="font-bold">{c.codigo}</p><p className="text-xs text-slate-500">{c.unidad} - {c.tipo}</p></div>
                <button onClick={() => cambiarEstado(c)} className={`px-3 py-1 rounded text-xs font-bold ${c.estadoOperativo === 'Disponible' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{c.estadoOperativo}</button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}