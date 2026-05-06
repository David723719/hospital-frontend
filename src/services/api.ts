// ✅ Tu configuración de proxy - MANTENER
const API = '/api';

// ✅ Fetch principal - TU VERSIÓN con credentials agregada
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API}${endpoint}`;
  try {
    const method = (options?.method || 'GET').toUpperCase();
    const hasBody = options?.body !== undefined && options?.body !== null;
    const headers: HeadersInit = {
      ...(options?.headers || {})
    };

    if (hasBody && !('Content-Type' in (headers as Record<string, string>))) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, { 
      method,
      headers,
      credentials: 'include',  // ← AGREGAR ESTA LÍNEA
      ...options 
    });
    
    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      if (res.status === 500) {
        console.error(`❌ ${endpoint}: HTTP 500 - Backend error`);
        throw new Error('Error interno del servidor');
      }
      const validationError =
        data?.errors && typeof data.errors === 'object'
          ? Object.values(data.errors).flat().find(Boolean)
          : null;
      throw new Error(
        String(validationError || data?.mensaje || data?.message || data?.title || `HTTP ${res.status}`)
      );
    }
    return data;
  } catch (e: any) {
    const isNetworkError = e?.message === 'Failed to fetch';
    const message = isNetworkError
      ? 'No se pudo conectar con el backend'
      : e.message;
    console.error(`❌ ${endpoint}:`, message);
    throw new Error(message);
  }
}

// ✅ Fetch para integraciones externas - TU VERSIÓN (sin cambios)
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
  } catch { return null; }
}

// ✅ API COMPLETA - TU VERSIÓN (sin cambios)
export const api = {
  pacientes: {
    list: () => fetchApi<any[]>('/pacientes'),
    create: (d: any) => {
      const payload: Record<string, any> = {
        Codigo: d.codigo,
        Nombre: d.nombre
      };
      if (d.fechaNacimiento) payload.FechaNacimiento = d.fechaNacimiento;
      return fetchApi('/pacientes', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    delete: (codigo: string) => fetchApi(`/pacientes/${codigo}`, { method: 'DELETE' }),
  },
  camas: {
    list: () => fetchApi<any[]>('/camas'),
    disponibles: () => fetchApi<any[]>('/camas/disponibles'),
    create: (d: any) => fetchApi('/camas', { 
      method: 'POST', 
      body: JSON.stringify({ Codigo: d.codigo, Unidad: d.unidad, Tipo: d.tipo, EstadoOperativo: 'Disponible' }) 
    }),
    cambiarEstado: (codigo: string, estado: string) => fetchApi(`/camas/${codigo}/estado`, { 
      method: 'PUT', 
      body: JSON.stringify({ EstadoOperativo: estado }) 
    }),
  },
  admisiones: {
    list: () => fetchApi<any[]>('/admisiones'),
    create: (d: any) => {
      const payload: Record<string, any> = {
        Codigo: d.codigo,
        PacienteCodigo: d.pacienteCodigo,
        CamaCodigo: d.camaCodigo,
        Especialidad: d.especialidad
      };
      if (d.fechaIngreso) payload.FechaIngreso = new Date(d.fechaIngreso).toISOString();
      return fetchApi('/admisiones', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    delete: (codigo: string) => fetchApi(`/admisiones/${codigo}`, { method: 'DELETE' }),
  },
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
        FechaInicio: d.fechaInicio || new Date().toISOString() 
      }) 
    }),
    delete: (codigo: string) => fetchApi(`/tratamientos/${codigo}`, { method: 'DELETE' }),
  },
  mis: {
    mensual: () => fetchApi<any[]>('/mis/estadistica-mensual'),
  },
  integracion: {
    farmacia: { catalogo: () => fetchIntegration<any[]>('farmacia', '/api/Medicamentos/catalogo') },
    emergencias: { triaje: () => fetchIntegration<any[]>('emergencias', '/api/triaje/pendientes') },
    rrhh: { medicos: () => fetchIntegration<any[]>('rrhh', '/api/doctores') },
    logistica: { camas: () => fetchIntegration<any[]>('logistica', '/api/camas') },
  },
  facturacion: {
    calcularEstimado: (dias: number, tipo: 'general'|'intermedia'|'uci') => {
      const tarifas = { general: 150, intermedia: 300, uci: 800 };
      const subtotal = dias * (tarifas[tipo] || 150);
      const impuestos = subtotal * 0.19;
      const total = subtotal + impuestos;
      return { subtotal, impuestos, total, moneda: 'USD' };
    },
  }
};