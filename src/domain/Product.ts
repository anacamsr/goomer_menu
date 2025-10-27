export type ProductCategory = 
  | 'Entradas' 
  | 'Pratos principais' 
  | 'Sobremesas' 
  | 'Bebidas';

export type ProductStatus = 'disponivel' | 'indisponivel';

export interface IProductDB {
  id: number;
  nome: string;
  preco: number; 
  categoria: ProductCategory;
  visivel: boolean; 
  ordem: number; 
}

export interface IProductInput {
  nome: string;
  preco: number;
  categoria: ProductCategory;
  visivel: boolean;
  ordem?: number; 
  status: ProductStatus;
}