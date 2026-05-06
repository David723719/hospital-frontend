// Configuración de proxy de Vercel
const API = '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
      ...options,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.mensaje || data.message || `HTTP ${res.status}`);
    }

    return data;
  } catch (error: any) {
    console.error(`❌ ${endpoint}:`, error.message);
    throw error;
  }
}

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

export const api = {
  pacientes: {
    list: () => fetchApi<any[]>('/pacientes'),
    create: (data: any) =>
      fetchApi('/pacientes', {
        method: 'POST',
        body: JSON.stringify({
          Codigo: data.codigo,
          Nombre: data.nombre,
          FechaNacimiento: data.fechaNacimiento,
        }),
      }),
    delete: (codigo: string) => fetchApi(`/pacientes/${codigo}`, { method: 'DELETE' }),
  },

  camas: {
    list: () => fetchApi<any[]>('/camas'),
    disponibles: () => fetchApi<any[]>('/camas/disponibles'),
    create: (data: any) =>
      fetchApi('/camas', {
        method: 'POST',
        body: JSON.stringify({
          Codigo: data.codigo,
          Unidad: data.unidad,
          Tipo: data.tipo,
          EstadoOperativo: 'Disponible',
        }),
      }),
    cambiarEstado: (codigo: string, estado: string) =>
      fetchApi(`/camas/${codigo}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ EstadoOperativo: estado }),
      }),
  },

  admisiones: {
    list: () => fetchApi<any[]>('/admisiones'),
    create: (data: any) =>
      fetchApi('/admisiones', {
        method: 'POST',
        body: JSON.stringify({
          Codigo: data.codigo,
          PacienteCodigo: data.pacienteCodigo,
          CamaCodigo: data.camaCodigo,
          FechaIngreso: data.fechaIngreso ? new Date(data.fechaIngreso).toISOString() : new Date().toISOString(),
          Especialidad: data.especialidad,
        }),
      }),
    delete: (codigo: string) => fetchApi(`/admisiones/${codigo}`, { method: 'DELETE' }),
  },

  tratamientos: {
    list: () => fetchApi<any[]>('/tratamientos'),
    create: (data: any) =>
      fetchApi('/tratamientos', {
        method: 'POST',
        body: JSON.stringify({
          Codigo: data.codigo,
          AdmisionCodigo: data.admisionCodigo,
          NombreMedicamento: data.nombreMedicamento,
          Dosis: data.dosis,
          DuracionDias: data.duracionDias,
          FechaInicio: data.fechaInicio || new Date().toISOString(),
        }),
      }),
    delete: (codigo: string) => fetchApi(`/tratamientos/${codigo}`, { method: 'DELETE' }),
  },

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

  facturacion: {
    calcularEstimado: (dias: number, tipo: 'general' | 'intermedia' | 'uci') => {
      const tarifas = { general: 150, intermedia: 300, uci: 800 };
      const subtotal = dias * (tarifas[tipo] || 150);
      const impuestos = subtotal * 0.19;
      return {
        subtotal,
        impuestos,
        total: subtotal + impuestos,
        moneda: 'USD',
      };
    },
  },
};