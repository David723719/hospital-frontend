import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';  // ← ESTE IMPORT FALTABA
import { Home, Users, Bed, FileText, Pill, BarChart3, Link2, DollarSign } from 'lucide-react';

const nav = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/pacientes', label: 'Pacientes', icon: Users },
  { path: '/camas', label: 'Camas', icon: Bed },
  { path: '/admisiones', label: 'Admisiones', icon: FileText },
  { path: '/tratamientos', label: 'Tratamientos', icon: Pill },
  { path: '/reportes', label: 'Reportes', icon: BarChart3 },
  { path: '/facturacion', label: 'Facturación', icon: DollarSign },
  { path: '/integraciones', label: 'Integraciones', icon: Link2 },
];

// ✅ EXPORTACIÓN CORRECTA (named export)
export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-hospital-900 text-white p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-6">🏥 Hospital ERP</h1>
        <nav className="flex-1 space-y-1">
          {nav.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  active ? 'bg-hospital-600' : 'hover:bg-hospital-800'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="text-xs text-hospital-200 mt-auto pt-4 border-t border-hospital-700">
          <p>Backend: {import.meta.env.PROD ? '🌐 Railway' : '🔧 Local'}</p>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}