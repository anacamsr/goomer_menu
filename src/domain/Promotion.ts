export type DayOfWeek =
  | 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY'
  | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';


export interface IPromotionInput {
  titulo: string;
  descricao: string;
  dia_semana: DayOfWeek; 
  horario_inicio: string;
  horario_fim: string; 
  product_id: number; 
  preco_promocional: number;
}

export interface IPromotionDB {
  id: number;
  descricao: string;
  preco_promocional: number;
  dia_semana: string;
  horario_inicio: string;
  horario_fim: string;
  product_id?: number; 
}