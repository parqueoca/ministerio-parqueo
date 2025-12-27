export enum ServerStatus {
  ACTIVO = 'Activo',
  INACTIVO = 'Inactivo'
}

export interface Group {
  id: string;
  name: string;
}

export interface ParkingPosition {
  id: string;
  code: string;
  name: string;
}

export interface Server {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  photo?: string;
  cedula: string;
  email: string;
  licencia_conducir: boolean;
  birthDate: string;
  mobile: string;
  joinDate: string;
  size: string;
  bloodType: string;
  address: string;
  emergencyContactName: string;
  emergency_contact_relationship: string;
  emergencyContactPhone: string;
  group: string;
  note: string;
  status: ServerStatus;
  createdAt: number;
}

// --- PUNTAJE MODULE TYPES ---

export interface PeriodoPuntaje {
  id: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

export interface AsistenciaPuntaje {
  id?: string;
  servidor_id: string;
  servicio_id: string;
  periodo_id: string;
  asistio: boolean;
  llego_puntual: boolean;
  llego_tarde: boolean;
  falto_sin_excusa: boolean;
  excusado: boolean;
  es_servicio_extra: boolean;
  nota_adicional?: string;
}

export interface RankingEntry {
  periodo_id: string;
  nombre_periodo: string;
  grupo: string;
  servidor_id: string;
  nombre_completo: string;
  puntaje_total: number;
  total_asistencias: number;
  total_puntuales: number;
  fecha_ingreso: string;
}

// --- VEHICLES MODULE TYPES ---

export interface VehicleCategory {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at?: string;
}

export interface Vehicle {
  id: string;
  placa: string;
  propietario: string;
  celular?: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  color?: string;
  categoria_id?: string;
  nota?: string;
  created_at?: string;
  vehiculo_categorias?: {
    nombre: string;
  };
}

// --- CALENDAR MODULE TYPES ---

export interface ServiceAssignment {
  serverId: string;
  positionId: string;
  servidores?: {
    firstName: string;
    lastName: string;
    photo?: string;
  };
}

export interface ServiceType {
  id: string;
  name: string;
  defaultTime: string;
  dayOfWeek: number;
}

export interface Service {
  id: string;
  name: string;
  date: string;
  arrivalTime: string;
  groupId: string;
  assignments: ServiceAssignment[];
  isExtra: boolean;
  note?: string;
  createdAt: number;
}

export type ViewState = 
  | 'dashboard' 
  | 'list' 
  | 'form' 
  | 'groups' 
  | 'setup' 
  | 'calendar' 
  | 'service-form' 
  | 'positions' 
  | 'settings'
  | 'vehicles'
  | 'vehicle-form'
  | 'vehicle-categories'
  | 'ranking'
  | 'attendance'
  | 'period-manager'
  | 'setup-repair';
