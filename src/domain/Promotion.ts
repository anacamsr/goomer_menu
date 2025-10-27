export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface IPromotionDB {
  id: number;
  descricao: string;
  preco_promocional: number;
  dia_semana_json: string; 
  horario_inicio: string;
  horario_fim: string;   
  related_product_ids?: number[];
}

export interface IPromotionInput {
  descricao: string;
  preco_promocional: number;
  dias_da_semana: DayOfWeek[]; 
  dia_semana_json: string;
  horario_inicio: string; 
  horario_fim: string;    
  product_ids: number[];
}