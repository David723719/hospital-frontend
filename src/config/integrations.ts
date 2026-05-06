export const INTEGRATIONS = {
    Farmacia: { 
      baseUrl: 'https://hospital3ernivel-farmacia.onrender.com', 
      endpoints: { 
        catalogo: '/api/Medicamentos/catalogo',
        disponibilidad: '/api/StocksActuales/disponibilidad'  // ← String, NO función
      }, 
      enabled: true 
    },
    Emergencias: { 
      baseUrl: 'https://hemergencias-production-82c5.up.railway.app', 
      endpoints: { triaje: '/api/triaje/pendientes' }, 
      enabled: true 
    },
    RecursosHumanos: { 
      baseUrl: 'https://rrhh-hospital-production.up.railway.app', 
      endpoints: { medicos: '/api/doctores' }, 
      enabled: true 
    },
    Logistica: { 
      baseUrl: 'https://logisticahospitalariabackend-production.up.railway.app', 
      endpoints: { camas: '/api/camas' }, 
      enabled: true 
    },
  } as const;
  
  export const getIntegrationUrl = (service: keyof typeof INTEGRATIONS, endpoint: string): string => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const isProd = host.includes('vercel.app') || host.includes('railway.app') || host.includes('onrender.com');
      if (isProd && INTEGRATIONS[service].enabled) return `${INTEGRATIONS[service].baseUrl}${endpoint}`;
    }
    const ports: Record<string, string> = { Farmacia: '5201', Emergencias: '5202', RecursosHumanos: '5203', Logistica: '5204' };
    return `http://localhost:${ports[service] || '5200'}${endpoint}`;
  };