const API = '/api';

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

export const api = {
  camas: {
    list: () => fetchApi<any[]>('/camas'),
    disponibles: () => fetchApi<any[]>('/camas/disponibles'),
    create: (d: any) => fetchApi('/camas', {
      method: 'POST',
      body: JSON.stringify({ Codigo: d.codigo, Unidad: d.unidad, Tipo: d.tipo, Estado: 'Activo' }),
    }),
    cambiarEstado: (codigo: string, estado: string) =>
      fetchApi(`/camas/${codigo}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ Estado: estado }),  // ← Solo Estado
      }),
  },
  pacientes: {
    list: () => fetchApi<any[]>('/pacientes'),
    create: (d: any) => fetchApi('/pacientes', {
      method: 'POST',
      body: JSON.stringify({ Codigo: d.codigo, Nombre: d.nombre, FechaNacimiento: d.fechaNacimiento }),
    }),
    delete: (codigo: string) => fetchApi(`/pacientes/${codigo}`, { method: 'DELETE' }),
  },
};