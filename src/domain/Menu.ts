import { ProductCategory } from './Product';

export interface IActivePromotion {
  descricao: string;
  precoPromocional: number;
}

export interface IMenuItem {
  id: number;
  nome: string;
  categoria: ProductCategory;
  precoBase: number;
  precoFinal: number; 
  promocaoAtiva?: IActivePromotion; 
  ordem: number; 
}