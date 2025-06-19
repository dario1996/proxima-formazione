export interface IArticoli {
  codart: string;
  descrizione: string;
  um: string;
  pzcart: number;
  peso: number;
  idStatoArt: string;
  status: string;
  prezzo: number;
  data: Date;
  imageUrl: string;
  famAssort: ICat;
  iva: IIva;
  barcode: IBarcode[];
}

export interface IIva {
  idIva: number;
  descrizione: string;
  aliquota: number;
}

export interface ICat {
  id: number;
  descrizione: string;
}

export interface IBarcode {
  barcode: string;
  idTipoArt: string;
}
