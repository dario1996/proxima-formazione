import { IVendite } from './Vendite';

export interface IVenditePage {
  content: IVendite[];
  totalElements: number;
  number: number;
  size: number;
  totalPages: number;
}
