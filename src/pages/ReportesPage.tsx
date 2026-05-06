import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import { BarChart3, Users, Bed, TrendingUp, Calendar, DollarSign } from 'lucide-react';

export function ReportesPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string; type: 'success'|'error'} | null>(null);
  
  const [stats, setStats] = useState({
    totalPacientes: 0,
    totalCamas: 0,
    camasOcupadas: 0,
    admisionesActivas: 0,
    tratamientosActivos: 0,
    ocupacionPorcentaje: 0,
    ingresosMes: 0,
    promedioEstancia: 0
  });

  const [reporteMensual, setReporteMensual] = useState<any[]>([]);
  const [camasPorUnidad, setCamasPorUnidad] = useState<any[]>([]);

  const generarReportes = async () => {
    setLoading(true);
    try {
      const [pacientes, camas, admisiones, tratamientos, mensual] = await Promise.all([
        api.pacientes.list().catch(() => []),
        api.camas.list().catch(() => []),
        api.admisiones.list().catch(() => []),
        api.tratamientos.list().catch(() => []),
        api.mis.mensual().catch(() => [])
      ]);

      const ocupadas = camas.filter((c: any) => c.estadoOperativo === 'Ocupada').length;
      const activas = admisiones.filter((a: any) => a.estado === 'Activo').length;
      const tratamientosActivos = tratamientos.filter((t: any) => t.estado === 'Activo').length;

      const unidades: Record<string, {total: number, ocupadas: number}> = {};
      camas.forEach((c: any) => {
        if (!unidades[c.unidad]) unidades[c.unidad] = {total: 0, ocupadas: 0};
        unidades[c.unidad].total++;
        if (c.estadoOperativo === 'Ocupada') unidades[c.unidad].ocupadas++;
      });

      const camasPorUnidadData = Object.entries(unidades).map(([unidad, data]: [string, any]) => ({
        unidad,
        total: data.total,
        ocupadas: data.ocupadas,
        porcentaje: parseFloat(((data.ocupadas / data.total) * 100).toFixed(1))
      }));

      let totalDias = 0;
      let count = 0;
      admisiones.forEach((a: any) => {
        if (a.fechaEgreso) {
          const dias = Math.ceil((new Date(a.fechaEgreso).getTime() - new Date(a.fechaIngreso).getTime()) / (1000 * 60 * 60 * 24));
          totalDias += dias;
          count++;
        }
      });
      const promedioEstancia = count > 0 ? parseFloat((totalDias / count).toFixed(1)) : 0;
      const ingresosEstimados = activas * 150 * 5;

      setStats({
        totalPacientes: pacientes.length,
        totalCamas: camas.length,
        camasOcupadas: ocupadas,
        admisionesActivas: activas,
        tratamientosActivos,
        ocupacionPorcentaje: camas.length > 0 ? parseFloat(((ocupadas / camas.length) * 100).toFixed(1)) : 0,
        ingresosMes: ingresosEstimados,
        promedioEstancia
      });

      setReporteMensual(mensual);
      setCamasPorUnidad(camasPorUnidadData);
      setToast({ message: '✅ Reportes generados', type: 'success' });
    } catch (e: any) {
      setToast({ message: `❌ Error: ${e.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { generarReportes(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📊 Reportes Automáticos</h1>
        <Button onClick={generarReportes} disabled={loading}>{loading ? 'Generando...' : '🔄 Actualizar'}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div><p className="text-sm opacity-90">Ocupación</p><p className="text-3xl font-bold">{stats.ocupacionPorcentaje}%</p></div>
            <Bed className="w-10 h-10 opacity-75" />
          </div>
          <p className="text-xs mt-2 opacity-75">{stats.camasOcupadas} de {stats.totalCamas} camas</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div><p className="text-sm opacity-90">Admisiones Activas</p><p className="text-3xl font-bold">{stats.admisionesActivas}</p></div>
            <Users className="w-10 h-10 opacity-75" />
          </div>
          <p className="text-xs mt-2 opacity-75">{stats.totalPacientes} pacientes totales</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div><p className="text-sm opacity-90">Tratamientos</p><p className="text-3xl font-bold">{stats.tratamientosActivos}</p></div>
            <TrendingUp className="w-10 h-10 opacity-75" />
          </div>
          <p className="text-xs mt-2 opacity-75">Activos actualmente</p>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div><p className="text-sm opacity-90">Ingresos Estimados</p><p className="text-2xl font-bold">${stats.ingresosMes.toLocaleString()}</p></div>
            <DollarSign className="w-10 h-10 opacity-75" />
          </div>
          <p className="text-xs mt-2 opacity-75">Este mes (estimado)</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Bed className="w-5 h-5" /> Ocupación por Unidad</h3>
        <div className="space-y-3">
          {camasPorUnidad.map((u: any) => (
            <div key={u.unidad} className="flex items-center gap-4">
              <span className="w-32 font-medium">{u.unidad}</span>
              <div className="flex-1 bg-slate-200 rounded-full h-6 overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-500 flex items-center justify-end pr-2" style={{ width: `${u.porcentaje}%` }}>
                  <span className="text-xs text-white font-bold">{u.porcentaje.toFixed(1)}%</span>
                </div>
              </div>
              <span className="text-sm text-slate-600 w-24 text-right">{u.ocupadas}/{u.total} camas</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Estadísticas de Estancia</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded"><span className="text-slate-600">Promedio de estancia:</span><span className="font-bold text-lg">{stats.promedioEstancia} días</span></div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded"><span className="text-slate-600">Total admisiones:</span><span className="font-bold text-lg">{reporteMensual.length}</span></div>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Resumen Mensual</h3>
          {reporteMensual.length > 0 ? (
            <div className="space-y-2">
              {reporteMensual.slice(0, 5).map((m: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-2 border-b last:border-0">
                  <span className="text-sm">{m.periodo || `Mes ${i+1}`}</span>
                  <div className="text-right"><p className="text-sm font-medium">{m.totalIngresos || 0} ingresos</p><p className="text-xs text-slate-500">{m.altasRealizadas || 0} altas</p></div>
                </div>
              ))}
            </div>
          ) : <p className="text-slate-500 text-sm">No hay datos mensuales disponibles</p>}
        </Card>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}