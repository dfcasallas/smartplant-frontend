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
