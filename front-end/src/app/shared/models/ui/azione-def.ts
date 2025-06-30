export interface IAzioneDef {
  label: string;
  icon?: string;
  action: string; // es: 'edit', 'delete'
  color?: 'primary' | 'danger' | 'secondary';
}