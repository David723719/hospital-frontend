import { useState } from 'react';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';

export function FacturacionPage() {
  const [dias, setDias] = useState(1);
  const [tipo, setTipo] = useState<'general' | 'intermedia' | 'uci'>('general');
  const [resultado, setResultado] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const calcular = () => {
    try {
      const r = api.facturacion.calcularEstimado(dias, tipo);
      setResultado(r);
      setToast({ message: '✅ Cálculo realizado', type: 'success' });
    } catch (e: any) {
      setToast({ message: `❌ Error: ${e.message}`, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">💰 Facturación</h1>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Calcular Estimado de Estancia</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Días de estancia</label>
            <input
              type="number"
              min="1"
              value={dias}
              onChange={(e) => setDias(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de habitación</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="general">General ($150/día)</option>
              <option value="intermedia">Intermedia ($300/día)</option>
              <option value="uci">UCI ($800/día)</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={calcular} className="w-full">Calcular</Button>
          </div>
        </div>
      </Card>

      {resultado && (
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <h3 className="font-semibold mb-4">Resultado del cálculo</h3>
          <div className="space-y-2 text-lg">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">${resultado.subtotal.toFixed(2)} {resultado.moneda}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Impuestos (19%):</span>
              <span>${resultado.impuestos.toFixed(2)} {resultado.moneda}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between text-xl font-bold text-blue-800">
              <span>Total:</span>
              <span>${resultado.total.toFixed(2)} {resultado.moneda}</span>
            </div>
          </div>
        </Card>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}