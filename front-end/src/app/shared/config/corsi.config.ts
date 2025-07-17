import { IColumnDef } from '../models/ui/column-def';
import { IAzioneDef, AzioneType, AzioneColor } from '../models/ui/azione-def';
import { IFiltroDef } from '../models/ui/filtro-def';

export const CORSI_COLUMNS: IColumnDef[] = [
  { key: 'nome', label: 'Nome', sortable: true, type: 'text' },
  { key: 'argomento', label: 'Macro argomento', sortable: true, type: 'text' },
  { key: 'impattoIsms', label: 'Impatto ISMS', sortable: true, type: 'text' },
  { key: 'durata', label: 'Durata', sortable: true, type: 'text' },
  { key: 'piattaformaNome', label: 'Modalità', sortable: true, type: 'text' },
];

export const CORSI_AZIONI: IAzioneDef[] = [
  {
    label: 'Modifica',
    icon: 'fa fa-pen',
    action: AzioneType.Edit,
    color: AzioneColor.Secondary,
  },
  {
    label: 'Elimina',
    icon: 'fa fa-trash',
    action: AzioneType.Delete,
    color: AzioneColor.Danger,
  },
];

export const CORSI_FILTRI: IFiltroDef[] = [
  {
    key: 'nome',
    label: 'Nome Corso',
    type: 'text',
    placeholder: 'Cerca nome corso',
    colClass: 'col-12 col-md-4 col-lg-3 mb-2',
  },
  {
    key: 'argomento',
    label: 'Macro-Argomento',
    type: 'text',
    placeholder: 'Cerca per argomento',
    colClass: 'col-12 col-md-4 col-lg-3 mb-2',
  },
  {
    key: 'impattoIsms',
    label: 'Impatto ISMS',
    type: 'select',
    options: [
      { value: '', label: 'Tutti' },
      { value: 'true', label: 'Si' },
      { value: 'false', label: 'No' },
    ],
    colClass: 'col-6 col-md-3 col-lg-2 mb-2',
  },
  {
    key: 'piattaforma',
    label: 'Modalità',
    type: 'select',
    options: [],
    colClass: 'col-12 col-md-4 col-lg-3 mb-2',
  },
];