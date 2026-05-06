import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { api } from '../services/api';

export function Dashboard() {
  const [stats, setStats] = useState({ pacientes: 0, camas: 0, admisiones: 0 });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    Promise.all([
      api.pacientes.list().catch(() => []),
      api.camas.list().catch(() => []),
      api.admisiones.list().catch(() => [])
    ]).then(([p, c, a]) => {
      setStats({ pacientes: p.length, camas: c.length, admisiones: a.filter((x: any) => x.estado === 'Activo').length });
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">Cargando dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">📊 Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><h3 className="text-sm text-slate-500">Pacientes</h3><p className="text-3xl font-bold text-hospital-600">{stats.pacientes}</p></Card>
        <Card><h3 className="text-sm text-slate-500">Camas</h3><p className="text-3xl font-bold text-hospital-600">{stats.camas}</p></Card>
        <Card><h3 className="text-sm text-slate-500">Admisiones Activas</h3><p className="text-3xl font-bold text-hospital-600">{stats.admisiones}</p></Card>
      </div>
      <Card>
        <h3 className="font-semibold mb-3">🔗 Estado de Integraciones</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Farmacia</span><span className="text-green-600">● Conectado</span></div>
          <div className="flex justify-between"><span>Emergencias</span><span className="text-green-600">● Conectado</span></div>
          <div className="flex justify-between"><span>Logística</span><span className="text-green-600">● Conectado</span></div>
          <div className="flex justify-between"><span>RRHH</span><span className="text-green-600">● Conectado</span></div>
          <div className="flex justify-between"><span>Facturación</span><span className="text-slate-400">○ Calculadora local</span></div>
        </div>
      </Card>
    </div>
  );
}