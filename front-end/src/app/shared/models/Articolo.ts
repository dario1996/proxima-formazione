export interface IArticolo {
  codArt: string;
  descrizione: string;
  um: string;
  pzCart: number;
  pesoNetto: number;
  idStatoArt: string;
  dataCreaz: Date;
  barcode: IBarcode[];
  ingredienti: IIngredienti;
  iva: IIva;
  famAssort: ICat;
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

export interface IIngredienti {
  codArt: string;
  info: string;
}
