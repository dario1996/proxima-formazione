export interface IColumnDef {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'date' | 'custom';
  sortable?: boolean;
  width?: string;
}