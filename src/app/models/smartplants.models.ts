export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface CatalogoResponse {
  id: number;
  valor: string;
}

export type Tipo = CatalogoResponse;
export type Familia = CatalogoResponse;
export type Mantenimiento = CatalogoResponse;
export type Salud = CatalogoResponse;

export interface TipoRequest {
  nombre: string;
}

export interface FamiliaRequest {
  nombre: string;
}

export interface MantenimientoRequest {
  nivel: string;
}

export interface SaludRequest {
  estado: string;
}

export interface Planta {
  id: number;
  nombre: string;
  descripcion: string | null;
  imageUrl?: string;
  tipo: CatalogoResponse;
  familia: CatalogoResponse;
  mantenimiento: CatalogoResponse;
  salud: CatalogoResponse;
}

export interface PlantaRequest {
  nombre: string;
  descripcion?: string | null;
  luz?: number | null;
  riego?: number | null;
  temperatura?: number | null;
  tamano?: number | null;
  ambiente?: number | null;
  tipoId: number;
  familiaId: number;
  mantenimientoId: number;
  saludId: number;
}

export interface SugerenciaRequest {
  mantenimiento: string;
  luz: number;
  riego: number;
  temperatura: number;
  tamano: number;
  ambiente: number;
}

export interface SugerenciaResponse {
  plantaId: number;
  nombre: string;
  descripcion: string | null;
  mantenimiento: string | null;
  puntaje: number;
}

export interface AgregarInventarioRequest {
  plantaId: number;
  nombrePersonalizado: string;
}

export interface InventarioResponse {
  id: number;
  usuarioId: number;
  plantaId: number;
  nombrePlanta: string;
  nombrePersonalizado: string;
  fechaAgregado: string;
}

export type TipoCuidado = 'RIEGO' | 'EXPOSICION_SOL' | 'ABONO' | 'PODA' | 'CAMBIO_UBICACION';

export interface RegistrarCuidadoRequest {
  tipoCuidado: TipoCuidado;
  observacion?: string | null;
}

export interface CuidadoPlantaResponse {
  id: number;
  inventarioId: number;
  tipoCuidado: TipoCuidado;
  fecha: string;
  observacion: string | null;
  proximaFechaSugerida: string;
}

export type CatalogKey = 'tipos' | 'familias' | 'mantenimientos' | 'saludes';
export type CatalogItem = CatalogoResponse;

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

export interface LoginResponse extends UsuarioResponse {
  token: string;
}
