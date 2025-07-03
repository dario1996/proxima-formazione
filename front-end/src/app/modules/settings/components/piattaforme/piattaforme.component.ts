import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { IPiattaforma } from '../../../../shared/models/Piattaforma';
import { CommonModule } from '@angular/common';
import { TabellaGenericaComponent } from '../../../../shared/components/tabella-generica/tabella-generica.component';
import { IColumnDef } from '../../../../shared/models/ui/column-def';
import {
  IAzioneDef,
  AzioneType,
  AzioneColor,
} from '../../../../shared/models/ui/azione-def';

@Component({
  selector: 'app-piattaforme',
  standalone: true,
  imports: [
    CommonModule,
    TabellaGenericaComponent,
  ],
  templateUrl: './piattaforme.component.html',
  styleUrl: './piattaforme.component.css',
})
export class PiattaformeComponent {
  @Input() piattaforme: IPiattaforma[] = [];
  @Output() action = new EventEmitter<{
    tab: string;
    type: string;
    payload?: any;
  }>();

  columns: IColumnDef[] = [
    { key: 'nome', label: 'Nome', sortable: true, type: 'text' },
    {
      key: 'descrizione',
      label: 'Descrizione',
      sortable: true,
      type: 'text',
    },
    {
      key: 'urlSito',
      label: 'URL Sito',
      sortable: true,
      type: 'text',
    },
    { key: 'attiva', label: 'Stato', sortable: true, type: 'badge' },
  ];

  actions: IAzioneDef[] = [
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

  // Gestione azioni dalla tabella generica
  onTabellaAzione(event: { tipo: string; item: IPiattaforma }) {
    if (event.tipo === AzioneType.Edit) {
      this.action.emit({
        tab: 'piattaforme',
        type: 'edit',
        payload: event.item,
      });
    } else if (event.tipo === AzioneType.Delete) {
      this.action.emit({
        tab: 'piattaforme',
        type: 'delete',
        payload: event.item,
      });
    }
  }
}
