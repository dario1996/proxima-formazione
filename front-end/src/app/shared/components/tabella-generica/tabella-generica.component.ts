import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IAzioneDef } from '../../models/ui/azione-def';
import { IColumnDef } from '../../models/ui/column-def';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabella-generica',
  imports: [CommonModule],
  templateUrl: './tabella-generica.component.html',
  styleUrl: './tabella-generica.component.css'
})
export class TabellaGenericaComponent {
  @Input() data: any[] = [];
  @Input() columns: IColumnDef[] = [];
  @Input() azioni: IAzioneDef[] = [];
  @Input() pageSize = 5;
  @Output() action = new EventEmitter<{ tipo: string; item: any }>();

  paginatedData: any[] = [];
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];

  ngOnChanges() {
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.data.length / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedData = this.data.slice(start, start + this.pageSize);
  }

  goTo(p: number) {
    if (p >= 1 && p <= this.totalPages) {
      this.currentPage = p;
      this.updatePagination();
    }
  }

  onAzione(tipo: string, item: any) {
    this.action.emit({ tipo, item });
  }
}
