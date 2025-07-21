import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { IAzioneDef, AzioneRenderType } from '../../models/ui/azione-def';
import { IColumnDef } from '../../models/ui/column-def';
import { CommonModule } from '@angular/common';
import { ViewChild, ElementRef } from '@angular/core';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-tabella-generica',
  imports: [CommonModule, StatusBadgeComponent],
  templateUrl: './tabella-generica.component.html',
  styleUrl: './tabella-generica.component.css'
})
export class TabellaGenericaComponent {
  // Input properties
  @Input() data: any[] = [];
  @Input() columns: IColumnDef[] = [];
  @Input() azioni: IAzioneDef[] = [];
  @Input() pageSize = 20; // Default: 20 items per page for consistent UX across all tables
  @Input() entityName = 'elementi';

  // Output events
  @Output() action = new EventEmitter<{ tipo: string; item: any }>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() switchToggle = new EventEmitter<{ action: string; item: any; currentState: boolean }>();
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
    console.log('🔄 TabellaGenerica ngOnChanges called with data:', this.data?.length, 'items');
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
    console.log('📄 TabellaGenerica updatePagination called with:', this.data?.length, 'total items, pageSize:', this.pageSize);
    
    // Calcola il numero totale di pagine
    this.totalPages = Math.ceil(this.data.length / this.pageSize);
    
    // Calcola l'indice di inizio e fine per la pagina corrente
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    
    // Estrae i dati per la pagina corrente
    this.paginatedData = this.data.slice(start, end);
    
    console.log('📄 TabellaGenerica paginatedData:', this.paginatedData?.length, 'items on current page');
    
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

  onSwitchToggle(tipo: string, item: any, event: any) {
    // Prevent the actual switch toggle - we'll handle it after confirmation
    event.preventDefault();
    
    // Get current state
    const currentState = this.getSwitchState({ action: tipo } as IAzioneDef, item);
    
    // Emit switch toggle event for parent component to handle confirmation
    this.switchToggle.emit({ 
      action: tipo, 
      item: item,
      currentState: currentState
    });
  }

  getSwitchState(azione: IAzioneDef, item: any): boolean {
    // For disable action, the switch should be ON when the item is ACTIVE
    if (azione.action === 'disable') {
      return item.attivo === 'Attivo' || item.attivo === true;
    }
    // Default behavior for other switch actions
    return false;
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

  /**
   * Calcola il numero di righe vuote necessarie per riempire lo spazio visibile
   * senza creare scroll inutile
   */
  getEmptyRows(): any[] {
    // Se non ci sono dati, non mostrare righe vuote
    if (this.paginatedData.length === 0) {
      return [];
    }

    // Se abbiamo già abbastanza dati per riempire la pagina, non aggiungere righe vuote
    if (this.paginatedData.length >= this.pageSize) {
      return [];
    }

    // Calcola le righe vuote per riempire meglio lo spazio disponibile
    // Se abbiamo meno della metà dei dati, aggiungi alcune righe vuote per aspetto più pieno
    const emptyRowsCount = this.paginatedData.length < this.pageSize / 2 
      ? Math.min(5, this.pageSize - this.paginatedData.length) // Massimo 5 righe vuote per aspetto migliore
      : this.pageSize - this.paginatedData.length; // Riempi completamente se siamo vicini al pageSize
    
    return new Array(emptyRowsCount);
  }

  /**
   * Controlla se un valore è vuoto o null e deve essere visualizzato come "-"
   */
  isEmptyValue(value: any): boolean {
    return value === null || value === undefined || value === '' || 
           (typeof value === 'string' && value.trim() === '');
  }

  /**
   * Formatta il testo in camel case corretto
   */
  formatToCamelCase(text: string): string {
    if (!text || typeof text !== 'string') {
      return text;
    }

    // Handle common abbreviations and special cases
    const specialCases: { [key: string]: string } = {
      'hr': 'HR',
      'it': 'IT',
      'ai': 'AI',
      'iot': 'IoT',
      'api': 'API',
      'ui': 'UI',
      'ux': 'UX',
      'ceo': 'CEO',
      'cto': 'CTO',
      'cfo': 'CFO',
      'isms': 'ISMS',
      'gdpr': 'GDPR',
      'iso': 'ISO',
      'srl': 'S.r.l.',
      'spa': 'S.p.A.',
      'snc': 'S.n.c.',
      'sas': 'S.a.s.',
    };

    // Handle Yes/No and categorical values that should remain uppercase
    const uppercaseValues: { [key: string]: string } = {
      'si': 'SI',
      'no': 'NO',
      'yes': 'YES',
      'ok': 'OK',
      'ko': 'KO',
      'n/a': 'N/A',
      'tbd': 'TBD',
      'asap': 'ASAP',
      'faq': 'FAQ',
      'pdf': 'PDF',
      'csv': 'CSV',
      'xml': 'XML',
      'json': 'JSON',
      'sql': 'SQL',
      'http': 'HTTP',
      'https': 'HTTPS',
      'ftp': 'FTP',
      'ssh': 'SSH',
      'vpn': 'VPN',
      'dns': 'DNS',
      'ip': 'IP',
      'tcp': 'TCP',
      'udp': 'UDP',
      'url': 'URL',
      'uri': 'URI',
      'api': 'API',
      'rest': 'REST',
      'soap': 'SOAP',
      'oauth': 'OAuth',
      'jwt': 'JWT',
      'sso': 'SSO',
      'ldap': 'LDAP',
      'ad': 'AD',
      'db': 'DB',
      'crm': 'CRM',
      'erp': 'ERP',
      'bi': 'BI',
      'kpi': 'KPI',
      'roi': 'ROI',
      'rfi': 'RFI',
      'rfp': 'RFP',
      'sla': 'SLA',
      'nda': 'NDA'
    };

    // Check if the entire text (trimmed and lowercased) is a special uppercase value
    const trimmedLower = text.trim().toLowerCase();
    if (uppercaseValues[trimmedLower]) {
      return uppercaseValues[trimmedLower];
    }

    return text
      .toLowerCase()
      .split(/[\s_-]+/) // Split on spaces, underscores, or hyphens
      .map(word => {
        if (word.length === 0) return word;
        
        // Check if it's a special case (abbreviation)
        const lowerWord = word.toLowerCase();
        if (specialCases[lowerWord]) {
          return specialCases[lowerWord];
        }
        
        // Check if it's an uppercase value
        if (uppercaseValues[lowerWord]) {
          return uppercaseValues[lowerWord];
        }
        
        // Standard camel case
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  /**
   * Restituisce il valore da visualizzare, "-" se vuoto, formattato in camel case se testo
   */
  getDisplayValue(value: any): string {
    if (this.isEmptyValue(value)) {
      return '-';
    }
    
    // If it's a string, apply camel case formatting
    if (typeof value === 'string') {
      return this.formatToCamelCase(value);
    }
    
    return value;
  }

  /**
   * Restituisce il valore da visualizzare per una colonna specifica, 
   * rispettando le impostazioni della colonna per il camel case
   */
  getDisplayValueForColumn(value: any, column: IColumnDef): string {
    if (this.isEmptyValue(value)) {
      return '-';
    }
    
    // If forceUppercase is enabled for this column, return uppercase
    if (column.forceUppercase && typeof value === 'string') {
      return value.toUpperCase();
    }
    
    // If camel case is disabled for this column, return as-is
    if (column.disableCamelCase) {
      return value;
    }
    
    // If it's a string, apply camel case formatting
    if (typeof value === 'string') {
      return this.formatToCamelCase(value);
    }
    
    return value;
  }

  /**
   * Restituisce il valore da visualizzare con eventuale troncamento per una colonna specifica
   */
  getDisplayValueWithTruncationForColumn(value: any, column: IColumnDef): string {
    const displayValue = this.getDisplayValueForColumn(value, column);
    if (displayValue === '-') {
      return displayValue;
    }
    const length = column.maxLength || 30;
    return this.shouldTruncate(displayValue, length) ? 
           this.getTruncatedText(displayValue, length) : displayValue;
  }

  /**
   * Determina se il testo deve essere troncato
   */
  shouldTruncate(text: string, maxLength?: number): boolean {
    const length = maxLength || 30;
    return text != null && text.length > length;
  }

  /**
   * Restituisce il testo troncato
   */
  getTruncatedText(text: string, maxLength?: number): string {
    const length = maxLength || 30;
    if (!text || text.length <= length) {
      return text;
    }
    return text.substring(0, length) + '...';
  }

  /**
   * Restituisce il valore da visualizzare con eventuale troncamento
   */
  getDisplayValueWithTruncation(value: any, maxLength?: number): string {
    const displayValue = this.getDisplayValue(value);
    if (displayValue === '-') {
      return displayValue;
    }
    const length = maxLength || 30;
    return this.shouldTruncate(displayValue, length) ? 
           this.getTruncatedText(displayValue, length) : displayValue;
  }

  /**
   * Formatta una data in modo sicuro per la visualizzazione
   */
  getFormattedDate(value: any): string {
    if (this.isEmptyValue(value)) {
      return '-';
    }
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return '-';
      }
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  }

  /**
   * Restituisce il valore formattato della data con eventuale troncamento
   */
  getFormattedDateWithTruncation(value: any, maxLength?: number): string {
    const formattedDate = this.getFormattedDate(value);
    if (formattedDate === '-') {
      return formattedDate;
    }
    const length = maxLength || 30;
    return this.shouldTruncate(formattedDate, length) ? 
           this.getTruncatedText(formattedDate, length) : formattedDate;
  }
}