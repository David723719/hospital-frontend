// ✅ Proxy de Vercel - MANTENER
const API = '/api';

// ✅ Fetch principal
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      credentials: 'include',
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.mensaje || data.message || `HTTP ${res.status}`);
    return data;
  } catch (e: any) {
    console.error(`❌ ${endpoint}:`, e.message);
    throw e;
  }
}

// ✅ Fetch para integraciones externas
async function fetchIntegration<T>(service: string, endpoint: string): Promise<T | null> {
  const urls: Record<string, string> = {
    farmacia: 'https://hospital3ernivel-farmacia.onrender.com',
    emergencias: 'https://hemergencias-production-82c5.up.railway.app',
    rrhh: 'https://rrhh-hospital-production.up.railway.app',
    logistica: 'https://logisticahospitalariabackend-production.up.railway.app',
  };
  const baseUrl = urls[service];
  if (!baseUrl) return null;
  try {
    const res = await fetch(`${baseUrl}${endpoint}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ✅ API COMPLETA - Todos los métodos que usan las páginas
export const api = {
  
  // === PACIENTES ===
  pacientes: {
    list: () => fetchApi<any[]>('/pacientes'),
    create: (d: any) => fetchApi('/pacientes', {
      method: 'POST',
      body: JSON.stringify({ Codigo: d.codigo, Nombre: d.nombre, FechaNacimiento: d.fechaNacimiento }),
    }),
    delete: (codigo: string) => fetchApi(`/pacientes/${codigo}`, { method: 'DELETE' }),
  },

  // === CAMAS ===
  camas: {
    list: () => fetchApi<any[]>('/camas'),
    disponibles: () => fetchApi<any[]>('/camas/disponibles'),
    create: (d: any) => fetchApi('/camas', {
      method: 'POST',
      body: JSON.stringify({ Codigo: d.codigo, Unidad: d.unidad, Tipo: d.tipo, EstadoOperativo: 'Disponible' }),
    }),
    cambiarEstado: (codigo: string, estado: string) =>
      fetchApi(`/camas/${codigo}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ EstadoOperativo: estado }),
      }),
  },

  // === ADMISIONES ===
  admisiones: {
    list: () => fetchApi<any[]>('/admisiones'),
    create: (d: any) => fetchApi('/admisiones', {
      method: 'POST',
      body: JSON.stringify({
        Codigo: d.codigo,
        PacienteCodigo: d.pacienteCodigo,
        CamaCodigo: d.camaCodigo,
        FechaIngreso: d.fechaIngreso ? new Date(d.fechaIngreso).toISOString() : new Date().toISOString(),
        Especialidad: d.especialidad,
      }),
    }),
    delete: (codigo: string) => fetchApi(`/admisiones/${codigo}`, { method: 'DELETE' }),
  },

  // === TRATAMIENTOS ===
  tratamientos: {
    list: () => fetchApi<any[]>('/tratamientos'),
    create: (d: any) => fetchApi('/tratamientos', {
      method: 'POST',
      body: JSON.stringify({
        Codigo: d.codigo,
        AdmisionCodigo: d.admisionCodigo,
        NombreMedicamento: d.nombreMedicamento,
        Dosis: d.dosis,
        DuracionDias: d.duracionDias,
        FechaInicio: d.fechaInicio || new Date().toISOString(),
      }),
    }),
    delete: (codigo: string) => fetchApi(`/tratamientos/${codigo}`, { method: 'DELETE' }),
  },

  // === REPORTES MIS ===
  mis: {
    mensual: () => fetchApi<any[]>('/mis/estadistica-mensual'),
    ocupacion: () => fetchApi<any[]>('/mis/ocupacion-camas'),
    conteo: () => fetchApi<any[]>('/mis/conteo-unidad'),
  },

  // === INTEGRACIONES ===
  integracion: {
    farmacia: {
      catalogo: () => fetchIntegration<any[]>('farmacia', '/api/Medicamentos/catalogo'),
    },
    emergencias: {
      triaje: () => fetchIntegration<any[]>('emergencias', '/api/triaje/pendientes'),
    },
    rrhh: {
      medicos: () => fetchIntegration<any[]>('rrhh', '/api/doctores'),
    },
    logistica: {
      camas: () => fetchIntegration<any[]>('logistica', '/api/camas'),
    },
  },

  // === FACTURACIÓN ===
  facturacion: {
    calcularEstimado: (dias: number, tipo: 'general' | 'intermedia' | 'uci') => {
      const tarifas = { general: 150, intermedia: 300, uci: 800 };
      const subtotal = dias * (tarifas[tipo] || 150);
      const impuestos = subtotal * 0.19;
      const total = subtotal + impuestos;
      return { subtotal, impuestos, total, moneda: 'USD' };
    },
  },
};