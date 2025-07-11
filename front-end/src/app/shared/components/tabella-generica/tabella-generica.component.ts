import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
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
  // Input properties
  @Input() data: any[] = [];
  @Input() columns: IColumnDef[] = [];
  @Input() azioni: IAzioneDef[] = [];
  @Input() pageSize = 20; // FISSO: Sempre 20 righe per pagina
  @Input() entityName = 'elementi';

  // Output events
  @Output() action = new EventEmitter<{ tipo: string; item: any }>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() paginationInfo = new EventEmitter<{
    currentPage: number;
    totalPages: number;
    pages: number[];
    displayedItems: number;
    totalItems: number;
    pageSize: number;
    entityName: string;
  }>();

  // ViewChild per accesso al container di scroll
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  // Proprietà per la paginazione
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

  ngAfterViewInit() {
    // RIMOSSO: Il calcolo automatico del pageSize
    // Aggiorna solo la paginazione
    setTimeout(() => {
      this.updatePagination();
    }, 100);
  }

  // RIMOSSO: Il metodo calculateOptimalPageSize()
  // RIMOSSO: Il listener window:resize per il calcolo automatico

  /**
   * Aggiorna la paginazione e emette i dati per il footer
   */
  updatePagination() {
    // Calcola il numero totale di pagine
    this.totalPages = Math.ceil(this.data.length / this.pageSize);
    
    // Calcola l'indice di inizio e fine per la pagina corrente
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    
    // Estrae i dati per la pagina corrente
    this.paginatedData = this.data.slice(start, end);
    
    // Aggiorna le pagine da mostrare
    this.updatePages();
    
    // Emette i dati di paginazione per il footer
    this.paginationInfo.emit({
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      pages: this.pages,
      displayedItems: this.paginatedData.length,
      totalItems: this.data.length,
      pageSize: this.pageSize,
      entityName: this.entityName
    });
  }

  private updatePages(): void {
    const maxPagesToShow = 5;
    this.pages = [];
    
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        this.pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
      
      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        this.pages.push(i);
      }
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePagination();
      
      // CORRETTO: Scroll in cima della tabella al cambio pagina
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = 0;
        this.scrollContainer.nativeElement.scrollLeft = 0;
      }
      
      // AGGIUNTO: Scroll anche della pagina principale
      this.scrollToTop();
    }
  }


  goTo(p: number) {
    if (p >= 1 && p <= this.totalPages) {
      this.currentPage = p;
      this.updatePagination();
      
      // AGGIUNTO: Scroll in cima anche per goTo
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = 0;
        this.scrollContainer.nativeElement.scrollLeft = 0;
      }
      
      this.scrollToTop();
    }
  }

  private scrollToTop(): void {
    // Scroll della finestra principale
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Scroll del body se necessario
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    // Cerca il contenitore della pagina e fai scroll anche di quello
    const pageContainer = document.querySelector('.page-container') as HTMLElement;
    if (pageContainer) {
      pageContainer.scrollTop = 0;
    }
    
    const pageContent = document.querySelector('.page-content') as HTMLElement;
    if (pageContent) {
      pageContent.scrollTop = 0;
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
    this.updatePagination();
  }
}