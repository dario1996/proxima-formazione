export enum AzioneColor {
  Primary = 'primary',
  Danger = 'danger',
  Secondary = 'secondary',
  Warning = 'warning',
  Success = 'success'
}

export enum AzioneType {
  Edit = 'edit',
  Delete = 'delete',
  Disable = 'disable',
  View = 'view'
}

export enum AzioneRenderType {
  Button = 'button',
  Switch = 'switch'
}

export interface IAzioneDef {
  label: string;
  icon?: string;
  action: AzioneType; // ora usa l'enum
  color?: AzioneColor; // ora usa l'enum
  renderType?: AzioneRenderType; // nuovo tipo di rendering
}