import { IProdottiVenduti } from './ProdottiVenduti';
import { IServiziVenduti } from './ServiziVenduti';

export interface IVendite {
  date: string;
  operator: string;
  customer: string;
  flValidity: string;
  soldProducts: IProdottiVenduti[];
  soldServices: IServiziVenduti[];
  total: number;
  notes: string;
}
