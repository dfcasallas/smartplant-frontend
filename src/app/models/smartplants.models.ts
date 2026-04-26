export interface Tipo {
  id: number;
  nombre: string;
}

export interface Familia {
  id: number;
  nombre: string;
}

export interface Mantenimiento {
  id: number;
  nivel: string;
}

export interface Salud {
  id: number;
  estado: string;
}

export interface Planta {
  id: number;
  nombre: string;
  descripcion?: string;
  imageUrl?: string;
  tipo: Tipo;
  familia: Familia;
  mantenimiento: Mantenimiento;
  salud: Salud;
}

export interface PlantaRequest {
  nombre: string;
  tipo: Pick<Tipo, 'id'>;
  familia: Pick<Familia, 'id'>;
  mantenimiento: Pick<Mantenimiento, 'id'>;
  salud: Pick<Salud, 'id'>;
}

export type CatalogKey = 'tipos' | 'familias' | 'mantenimientos' | 'saludes';
export type CatalogItem = Tipo | Familia | Mantenimiento | Salud;

export type Rol = 'USER' | 'ADMIN';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  rol?: Rol;
}

export interface UsuarioResponse {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  ultimaConexion: string | null;
}
