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

  const loadPacientes = async () => {
    setLoading(true);
    try {
      const data = await api.pacientes.list();
      setPacientes(data);
    } catch (error: any) {
      setToast({ message: `❌ Error: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPacientes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codigo || !form.nombre) {
      setToast({ message: '⚠️ Complete los campos obligatorios', type: 'error' });
      return;
    }

    try {
      await api.pacientes.create(form);
      setToast({ message: '✅ Paciente registrado correctamente', type: 'success' });
      setForm({ codigo: '', nombre: '', fechaNacimiento: '' });
      loadPacientes();
    } catch (error: any) {
      setToast({ message: `❌ Error: ${error.message}`, type: 'error' });
    }
  };

  const handleDelete = async (codigo: string) => {
    if (!confirm('¿Está seguro de dar de baja este paciente?')) return;

    try {
      await api.pacientes.delete(codigo);
      setToast({ message: '✅ Paciente dado de baja', type: 'success' });
      loadPacientes();
    } catch (error: any) {
      setToast({ message: `❌ Error: ${error.message}`, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">👥 Gestión de Pacientes</h1>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Registrar Nuevo Paciente</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Código *</label>
            <input
              type="text"
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="PAC-001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nombre *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Nombre completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha Nacimiento</label>
            <input
              type="date"
              value={form.fechaNacimiento}
              onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Registrar
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Pacientes Registrados ({pacientes.length})</h2>

        {loading ? (
          <p className="text-gray-500 text-center py-8">Cargando...</p>
        ) : pacientes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay pacientes registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Código</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nacimiento</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pacientes.map((paciente) => (
                  <tr key={paciente.codigo} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{paciente.codigo}</td>
                    <td className="px-4 py-3 text-sm">{paciente.nombre}</td>
                    <td className="px-4 py-3 text-sm">
                      {paciente.fechaNacimiento?.split('T')[0] || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(paciente.codigo)}
                        className="text-sm"
                      >
                        Dar de Baja
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}