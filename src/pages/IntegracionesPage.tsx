import { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import { api } from '../services/api';

export function IntegracionesPage() {
  const [farmacia, setFarmacia] = useState<any[]>([]);
  const [emergencias, setEmergencias] = useState<any[]>([]);
  const [medicos, setMedicos] = useState<any[]>([]);
  const [logistica, setLogistica] = useState<any[]>([]);
  const [calculadora, setCalculadora] = useState({ dias: 1, tipo: 'general' as const });
  
  // ✅ CORRECCIÓN: Solo 'success' | 'error'. El componente Toast no acepta 'info'.
  const [toast, setToast] = useState<{message: string; type: 'success'|'error'} | null>(null);
  
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const loadFarmacia = async () => { 
    setLoading(p => ({...p, farmacia: true})); 
    try { 
      const data = await api.integracion.farmacia.catalogo(); 
      if (data) { setFarmacia(data); setToast({ message: `✅ ${data.length} medicamentos`, type: 'success' }); }
      // ✅ CORRECCIÓN: Cambiado 'info' por 'error' para coincidir con Toast.tsx
      else setToast({ message: '⚠️ Farmacia no responde', type: 'error' });
    } catch (e: any) { setToast({ message: `❌ ${e.message}`, type: 'error' }); } 
    finally { setLoading(p => ({...p, farmacia: false})); } 
  };

  const loadEmergencias = async () => { 
    setLoading(p => ({...p, emergencias: true})); 
    try { 
      const data = await api.integracion.emergencias.triaje(); 
      if (data) { setEmergencias(data); setToast({ message: `✅ ${data.length} en triaje`, type: 'success' }); }
      else setToast({ message: '⚠️ Emergencias no responde', type: 'error' });
    } catch (e: any) { setToast({ message: `❌ ${e.message}`, type: 'error' }); } 
    finally { setLoading(p => ({...p, emergencias: false})); } 
  };

  const loadRRHH = async () => { 
    setLoading(p => ({...p, rrhh: true})); 
    try { 
      const data = await api.integracion.rrhh.medicos(); 
      if (data) { setMedicos(data); setToast({ message: `✅ ${data.length} médicos`, type: 'success' }); }
      else setToast({ message: '⚠️ RRHH no responde', type: 'error' });
    } catch (e: any) { setToast({ message: `❌ ${e.message}`, type: 'error' }); } 
    finally { setLoading(p => ({...p, rrhh: false})); } 
  };

  const loadLogistica = async () => { 
    setLoading(p => ({...p, logistica: true})); 
    try { 
      const data = await api.integracion.logistica.camas(); 
      if (data) { setLogistica(data); setToast({ message: `✅ ${data.length} camas`, type: 'success' }); }
      else setToast({ message: '⚠️ Logística no responde', type: 'error' });
    } catch (e: any) { setToast({ message: `❌ ${e.message}`, type: 'error' }); } 
    finally { setLoading(p => ({...p, logistica: false})); } 
  };

  const calcularFacturacion = () => { 
    const r = api.facturacion.calcularEstimado(calculadora.dias, calculadora.tipo); 
    setToast({ message: `💰 Estimado: $${r.total.toFixed(2)} ${r.moneda}`, type: 'success' }); 
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🔗 Integraciones</h1>
      {[ 
        { name: 'Farmacia', data: farmacia, load: loadFarmacia, loading: loading.farmacia }, 
        { name: 'Emergencias', data: emergencias, load: loadEmergencias, loading: loading.emergencias }, 
        { name: 'RRHH', data: medicos, load: loadRRHH, loading: loading.rrhh }, 
        { name: 'Logística',  logistica, load: loadLogistica, loading: loading.logistica }
      ].map(s => (
        <Card key={s.name}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">{s.name}</h3>
            <Button onClick={s.load} disabled={s.loading}>{s.loading ? 'Cargando...' : 'Cargar'}</Button>
          </div>
          {s.data && s.data.length > 0 && <div className="max-h-32 overflow-y-auto text-sm space-y-1">{s.data.slice(0, 5).map((item: any, i: number) => (<div key={i} className="flex justify-between"><span>{item.nombre || item.codigo || `Item #${i+1}`}</span><span className="text-slate-500">{item.stock ?? item.especialidad ?? item.unidad ?? ''}</span></div>))}</div>}
        </Card>
      ))}
      <Card>
        <h3 className="font-semibold mb-3">💰 Facturación (Estimador)</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><label className="text-sm font-medium">Días</label><input type="number" min="1" value={calculadora.dias} onChange={e => setCalculadora(p => ({...p, dias: parseInt(e.target.value)||1}))} className="w-full mt-1 p-2 border rounded"/></div>
          <div><label className="text-sm font-medium">Tipo</label><select value={calculadora.tipo} onChange={e => setCalculadora(p => ({...p, tipo: e.target.value as any}))} className="w-full mt-1 p-2 border rounded"><option value="general">General ($150/día)</option><option value="intermedia">Intermedia ($300/día)</option><option value="uci">UCI ($800/día)</option></select></div>
        </div>
        <Button onClick={calcularFacturacion}>Calcular</Button>
      </Card>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}