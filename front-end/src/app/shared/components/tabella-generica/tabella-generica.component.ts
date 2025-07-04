import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IAzioneDef } from '../../models/ui/azione-def';
import { IColumnDef } from '../../models/ui/column-def';
import { CommonModule } from '@angular/common';
import { ViewChild, ElementRef } from '@angular/core';


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
  @Input() pageSize = 20;
  @Output() action = new EventEmitter<{ tipo: string; item: any }>();
  @Output() rowClick = new EventEmitter<any>();

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  paginatedData: any[] = [];
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

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

      // Scroll in cima al contenitore
      // setTimeout(() => {
      //   this.scrollContainer?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
      // }, 0);
    }
  }

  onAzione(tipo: string, item: any) {
    this.action.emit({ tipo, item });
  }
  
  onRowClick(row: any) {
    this.rowClick.emit(row);
  }

  sortBy(column: string) {
  if (!column || column === 'azioni') return;
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }
  this.sortData();
}

sortData() {
  if (!this.sortColumn) return;
  this.data.sort((a, b) => {
    const aValue = a[this.sortColumn!];
    const bValue = b[this.sortColumn!];
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return this.sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    return this.sortDirection === 'asc'
      ? (aValue > bValue ? 1 : -1)
      : (aValue < bValue ? 1 : -1);
  });
  this.updatePagination(); // aggiorna la pagina corrente dopo l'ordinamento
}

}