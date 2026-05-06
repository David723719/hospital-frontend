export interface Paciente { codigo: string; nombre: string; fechaNacimiento: string; estado?: string; }
export interface Cama { codigo: string; codigoLogistica?: string; unidad: string; tipo: string; estadoOperativo: 'Disponible'|'Ocupada'|'Mantenimiento'; fechaRegistro?: string; }
export interface Admision { codigo: string; pacienteCodigo: string; camaCodigo: string; fechaIngreso: string; fechaEgreso?: string | null; especialidad: string; estado?: string; }
export interface Tratamiento { codigo: string; admisionCodigo: string; nombreMedicamento: string; dosis: string; duracionDias: number; fechaInicio: string; estado?: string; }
export interface ReporteOcupacion { admision: string; paciente: string; cama: string; unidad: string; especialidad: string; }
export interface ReporteConteo { unidad: string; totalPacientes: number; }
export interface ReporteDias { unidad: string; totalDias: number; }
export interface ReporteMensual { periodo: string; totalIngresos: number; altasRealizadas: number; }
export interface MedicamentoDto { codigo: string; nombre: string; stock?: number; precio?: number; }
export interface MedicoDto { codigo: string; nombre: string; especialidad: string; disponible?: boolean; }
export interface TriajeDto { id: string; nombre?: string; prioridad: 'Alta'|'Media'|'Baja'; estado: string; }