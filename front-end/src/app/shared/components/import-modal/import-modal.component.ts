import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ImportOption {
  key: string;
  label: string;
  value: boolean;
}

export interface ImportData {
  [key: string]: any;
  errors?: string[];
  isDuplicate?: boolean;
  canUpdate?: boolean;
}

export interface ImportStats {
  total: number;
  valid: number;
  duplicates: number;
  errors: number;
}

@Component({
  selector: 'app-import-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './import-modal.component.html',
  styleUrls: ['./import-modal.component.css']
})
export class ImportModalComponent implements OnInit {
  @Input() title: string = 'Importazione Dati';
  @Input() supportedFormats: string[] = [];
  @Input() expectedHeaders: string[] = [];
  @Input() previewData: ImportData[] = [];
  @Input() importOptions: Array<{
    key: string;
    label: string;
    description?: string;
    value: boolean;
  }> = [];
  @Input() isProcessing: boolean = false;
  @Input() showPreview: boolean = false;
  @Input() validationErrors: string[] = [];
  @Input() tableColumns: { key: string; label: string; render?: (item: any) => string }[] = [];
  
  @Output() fileSelected = new EventEmitter<File>();
  @Output() importOptionsChanged = new EventEmitter<{ [key: string]: any }>();
  @Output() importConfirmed = new EventEmitter<void>();
  @Output() importCancelled = new EventEmitter<void>();
  @Output() resetRequested = new EventEmitter<void>();

  selectedFile: File | null = null;
  optionsExpanded: boolean = false;
  showOptionsDropdown = false;

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileSelected.emit(this.selectedFile);
    }
  }

  onOptionChange(): void {
    const options: { [key: string]: any } = {};
    this.importOptions.forEach(option => {
      options[option.key] = option.value;
    });
    this.importOptionsChanged.emit(options);
  }

  onImportConfirm(): void {
    this.importConfirmed.emit();
  }

  onImportCancel(): void {
    this.importCancelled.emit();
  }

  onResetImport(): void {
    this.resetRequested.emit();
  }

  getStats(): ImportStats {
    const total = this.previewData.length;
    const valid = this.getValidData().length;
    const duplicates = this.previewData.filter(item => item.isDuplicate).length;
    const errors = this.previewData.filter(item => item.errors && item.errors.length > 0).length;
    
    return { total, valid, duplicates, errors };
  }

  getValidData(): ImportData[] {
    return this.previewData.filter(item => {
      const hasBasicErrors = item.errors && item.errors.some(error => 
        !error.toLowerCase().includes('duplicato') && !error.toLowerCase().includes('esistente')
      );
      
      if (hasBasicErrors) {
        return false;
      }
      
      if (item.isDuplicate) {
        const updateOption = this.importOptions.find(opt => opt.key === 'updateExisting');
        return item.canUpdate && updateOption?.value;
      }
      
      return true;
    });
  }

  getRowClass(item: ImportData): string {
    if (item.errors && item.errors.length > 0) {
      return 'table-danger';
    }
    if (item.isDuplicate) {
      return 'table-warning';
    }
    return 'table-success';
  }

  getRowIcon(item: ImportData): string {
    if (item.errors && item.errors.length > 0) {
      return 'fas fa-exclamation-circle text-danger';
    }
    if (item.isDuplicate) {
      return 'fas fa-exclamation-triangle text-warning';
    }
    return 'fas fa-check-circle text-success';
  }

  renderCellValue(item: ImportData, column: { key: string; label: string; render?: (item: any) => string }): string {
    if (column.render) {
      return column.render(item);
    }
    return item[column.key] || '-';
  }

  toggleOptions(): void {
    this.optionsExpanded = !this.optionsExpanded;
  }

  toggleOptionsDropdown() {
    this.showOptionsDropdown = !this.showOptionsDropdown;
    
    // Chiudi quando si clicka fuori
    if (this.showOptionsDropdown) {
      setTimeout(() => {
        document.addEventListener('click', this.closeOptionsOnOutsideClick.bind(this), { once: true });
      }, 100);
    }
  }

  private closeOptionsOnOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.options-dropdown');
    if (!dropdown) {
      this.showOptionsDropdown = false;
    }
  }

  onImportOptionChange(optionKey: string, event: any) {
    const isChecked = event.target.checked;
    
    // Trova l'opzione e aggiorna il valore
    const option = this.importOptions.find(opt => opt.key === optionKey);
    if (option) {
      option.value = isChecked;
    }
    
    // Emetti l'evento per notificare il componente padre
    this.importOptionsChanged.emit({ key: optionKey, value: isChecked });
  }

  getFormattedFileTypes(): string {
    return this.supportedFormats.join(', ');
  }

  hasValidationErrors(): boolean {
    return this.validationErrors.length > 0;
  }

  getErrorDetails(): { row: number; data: ImportData }[] {
    return this.previewData
      .map((item, index) => ({ row: index + 1, data: item }))
      .filter(({ data }) => data.errors && data.errors.length > 0);
  }
}
