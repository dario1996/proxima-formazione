export interface IColumnDef {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'date' | 'custom';
  sortable?: boolean;
  width?: string;
  statusType?: string; // For badge type columns - specifies which status configuration to use
  maxLength?: number; // Maximum length for text truncation (default: 30)
  disableCamelCase?: boolean; // If true, disables automatic camel case formatting for this column
  forceUppercase?: boolean; // If true, forces all values to uppercase (useful for categorical values like SI/NO)
}