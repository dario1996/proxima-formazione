import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'badge' | 'actions' | 'custom';
  width?: string;
  align?: 'left' | 'center' | 'right';
  customTemplate?: TemplateRef<any>;
}

export interface TableAction {
  label: string;
  icon: string;
  type: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  handler: (item: any) => void;
  disabled?: (item: any) => boolean;
  visible?: (item: any) => boolean;
}

export interface TableFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  options?: { value: any; label: string }[];
  placeholder?: string;
}

export interface TableConfig {
  searchable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  clickableRows?: boolean;
  emptyMessage?: string;
  loading?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Loading State -->
    <div *ngIf="config?.loading" class="table-loading">
      <div class="spinner">
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div *ngIf="filters?.length && config?.filterable" class="table-filters">
      <div class="filters-grid">
        <div *ngFor="let filter of filters" class="filter-item">
          <ng-container [ngSwitch]="filter.type">
            <!-- Text Search -->
            <div *ngSwitchCase="'text'" class="form-field">
              <label [for]="filter.key" class="form-label">{{
                filter.label
              }}</label>
              <input
                [id]="filter.key"
                type="text"
                class="form-input"
                [placeholder]="filter.placeholder || ''"
                [(ngModel)]="filterValues[filter.key]"
                (ngModelChange)="onFilterChange()"
              />
            </div>

            <!-- Select Dropdown -->
            <div *ngSwitchCase="'select'" class="form-field">
              <label [for]="filter.key" class="form-label">{{
                filter.label
              }}</label>
              <select
                [id]="filter.key"
                class="form-input"
                [(ngModel)]="filterValues[filter.key]"
                (ngModelChange)="onFilterChange()"
              >
                <option value="">All</option>
                <option
                  *ngFor="let option of filter.options"
                  [value]="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- Checkbox -->
            <div *ngSwitchCase="'checkbox'" class="form-field">
              <div class="checkbox-wrapper">
                <input
                  [id]="filter.key"
                  type="checkbox"
                  class="checkbox-input"
                  [(ngModel)]="filterValues[filter.key]"
                  (ngModelChange)="onFilterChange()"
                />
                <label [for]="filter.key" class="checkbox-label">{{
                  filter.label
                }}</label>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Clear Filters Button -->
        <div class="filter-actions">
          <button class="btn btn-secondary btn-sm" (click)="clearFilters()">
            <svg
              class="btn-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Table Container -->
    <div class="table-container" [class.loading]="config.loading">
      <table class="data-table">
        <!-- Table Header -->
        <thead class="table-header">
          <tr>
            <th *ngIf="config?.selectable" class="select-column">
              <input
                type="checkbox"
                class="checkbox-input"
                [checked]="allSelected"
                [indeterminate]="someSelected"
                (change)="toggleSelectAll()"
              />
            </th>
            <th
              *ngFor="let column of columns"
              [class]="'table-cell table-cell-' + (column.align || 'left')"
              [style.width]="column.width"
              [class.sortable]="column.sortable"
              (click)="column.sortable ? sort(column.key) : null"
            >
              <div class="table-header-content">
                <span>{{ column.label }}</span>
                <svg
                  *ngIf="column.sortable && sortColumn === column.key"
                  class="sort-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    *ngIf="sortDirection === 'asc'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 15l7-7 7 7"
                  />
                  <path
                    *ngIf="sortDirection === 'desc'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </th>
            <th
              *ngIf="actions?.length"
              class="actions-column table-cell-center"
            >
              Actions
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="table-body">
          <!-- Empty State -->
          <tr
            *ngIf="processedData.length === 0 && !config?.loading"
            class="empty-row"
          >
            <td [attr.colspan]="totalColumns" class="empty-cell">
              <div class="empty-state">
                <svg
                  class="empty-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p class="empty-message">
                  {{ config.emptyMessage || 'No data available' }}
                </p>
              </div>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr
            *ngFor="
              let item of processedData;
              let i = index;
              trackBy: trackByFn
            "
            class="table-row"
            [class.selected]="selectedItems.has(getItemId(item))"
            [class.clickable]="config.clickableRows"
            (click)="config.clickableRows ? onRowClick(item) : null"
          >
            <!-- Selection Column -->
            <td
              *ngIf="config?.selectable"
              class="table-cell select-cell"
              (click)="$event.stopPropagation()"
            >
              <input
                type="checkbox"
                class="checkbox-input"
                [checked]="selectedItems.has(getItemId(item))"
                (change)="toggleSelect(item)"
              />
            </td>

            <!-- Data Columns -->
            <td
              *ngFor="let column of columns"
              [class]="'table-cell table-cell-' + (column.align || 'left')"
            >
              <ng-container [ngSwitch]="column.type || 'text'">
                <!-- Text Content -->
                <span *ngSwitchCase="'text'">{{
                  getNestedValue(item, column.key)
                }}</span>

                <!-- Badge Content -->
                <span
                  *ngSwitchCase="'badge'"
                  class="badge"
                  [class]="getBadgeClass(item, column.key)"
                >
                  {{ getNestedValue(item, column.key) }}
                </span>

                <!-- Custom Template -->
                <ng-container *ngSwitchCase="'custom'">
                  <ng-container
                    *ngTemplateOutlet="
                      column.customTemplate || null;
                      context: { $implicit: item, column: column }
                    "
                  ></ng-container>
                </ng-container>
              </ng-container>
            </td>

            <!-- Actions Column -->
            <td
              *ngIf="actions?.length"
              class="table-cell actions-cell"
              (click)="$event.stopPropagation()"
            >
              <div class="action-buttons">
                <button
                  *ngFor="let action of getVisibleActions(item)"
                  [class]="'btn btn-' + action.type + ' btn-sm action-btn'"
                  [disabled]="action.disabled ? action.disabled(item) : false"
                  [title]="action.label"
                  (click)="action.handler(item)"
                >
                  <svg
                    class="btn-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      [attr.d]="getIconPath(action.icon)"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination (if needed) -->
    <div *ngIf="pagination" class="table-pagination">
      <div class="pagination-info">
        Showing {{ (pagination.currentPage - 1) * pagination.pageSize + 1 }} to
        {{ getMaxDisplayedItems() }}
        of {{ pagination.totalItems }} entries
      </div>
      <div class="pagination-controls">
        <button
          class="btn btn-secondary btn-sm"
          [disabled]="pagination.currentPage === 1"
          (click)="onPageChange(pagination.currentPage - 1)"
        >
          Previous
        </button>
        <button
          *ngFor="let page of getPaginationPages()"
          class="btn btn-sm"
          [class.btn-primary]="page === pagination.currentPage"
          [class.btn-ghost]="page !== pagination.currentPage"
          (click)="onPageChange(page)"
        >
          {{ page }}
        </button>
        <button
          class="btn btn-secondary btn-sm"
          [disabled]="pagination.currentPage === pagination.totalPages"
          (click)="onPageChange(pagination.currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./data-table.component.css'],
})
export class DataTableComponent {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() filters: TableFilter[] = [];
  @Input() config: TableConfig = {
    searchable: false,
    filterable: false,
    selectable: false,
    clickableRows: false,
    emptyMessage: 'No data available',
    loading: false,
  };
  @Input() pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };

  @Output() rowClick = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() filterChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<{
    column: string;
    direction: 'asc' | 'desc';
  }>();
  @Output() pageChange = new EventEmitter<number>();

  // Internal state
  processedData: any[] = [];
  filterValues: any = {};
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedItems = new Set<any>();

  ngOnInit() {
    this.initializeFilters();
    this.processData();
  }

  ngOnChanges() {
    this.processData();
  }

  private initializeFilters() {
    this.filters?.forEach(filter => {
      if (filter.type === 'checkbox') {
        this.filterValues[filter.key] = false;
      } else {
        this.filterValues[filter.key] = '';
      }
    });
  }

  private processData() {
    let result = [...this.data];

    // Apply filters
    if (this.config.filterable && this.filters?.length) {
      result = this.applyFilters(result);
    }

    // Apply sorting
    if (this.sortColumn) {
      result = this.applySorting(result);
    }

    this.processedData = result;
  }

  private applyFilters(data: any[]): any[] {
    return data.filter(item => {
      return this.filters.every(filter => {
        const filterValue = this.filterValues[filter.key];
        const itemValue = this.getNestedValue(item, filter.key);

        switch (filter.type) {
          case 'text':
            return (
              !filterValue ||
              String(itemValue)
                .toLowerCase()
                .includes(String(filterValue).toLowerCase())
            );
          case 'select':
            return !filterValue || itemValue === filterValue;
          case 'checkbox':
            return !filterValue || Boolean(itemValue) === Boolean(filterValue);
          default:
            return true;
        }
      });
    });
  }

  private applySorting(data: any[]): any[] {
    return data.sort((a, b) => {
      const aValue = this.getNestedValue(a, this.sortColumn);
      const bValue = this.getNestedValue(b, this.sortColumn);

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return this.sortDirection === 'desc' ? -comparison : comparison;
    });
  }

  // Public methods
  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.processData();
    this.sortChange.emit({ column, direction: this.sortDirection });
  }

  onFilterChange() {
    this.processData();
    this.filterChange.emit(this.filterValues);
  }

  clearFilters() {
    this.initializeFilters();
    this.processData();
    this.filterChange.emit(this.filterValues);
  }

  onRowClick(item: any) {
    this.rowClick.emit(item);
  }

  toggleSelect(item: any) {
    const id = this.getItemId(item);
    if (this.selectedItems.has(id)) {
      this.selectedItems.delete(id);
    } else {
      this.selectedItems.add(id);
    }
    this.emitSelection();
  }

  toggleSelectAll() {
    if (this.allSelected) {
      this.selectedItems.clear();
    } else {
      this.processedData.forEach(item => {
        this.selectedItems.add(this.getItemId(item));
      });
    }
    this.emitSelection();
  }

  onPageChange(page: number) {
    this.pageChange.emit(page);
  }

  // Helper methods
  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o && o[p], obj);
  }

  getItemId(item: any): any {
    return item.id || item;
  }

  getBadgeClass(item: any, key: string): string {
    const value = this.getNestedValue(item, key);
    // This can be customized based on your business logic
    if (typeof value === 'boolean') {
      return value ? 'badge-success' : 'badge-secondary';
    }
    return 'badge-primary';
  }

  getVisibleActions(item: any): TableAction[] {
    return this.actions.filter(
      action => !action.visible || action.visible(item),
    );
  }

  getIconPath(icon: string): string {
    const icons: Record<string, string> = {
      edit: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10',
      delete:
        'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
      view: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
      toggle:
        'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
    };
    return icons[icon] || icons['edit'];
  }

  getMaxDisplayedItems(): number {
    if (!this.pagination) return 0;
    return Math.min(
      this.pagination.currentPage * this.pagination.pageSize,
      this.pagination.totalItems,
    );
  }

  getPaginationPages(): number[] {
    if (!this.pagination) return [];

    const totalPages = this.pagination.totalPages;
    const currentPage = this.pagination.currentPage;
    const pages: number[] = [];

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  trackByFn = (index: number, item: any): any => {
    return this.getItemId(item);
  };

  private emitSelection() {
    const selectedData = this.processedData.filter(item =>
      this.selectedItems.has(this.getItemId(item)),
    );
    this.selectionChange.emit(selectedData);
  }

  // Computed properties
  get allSelected(): boolean {
    return (
      this.processedData.length > 0 &&
      this.processedData.every(item =>
        this.selectedItems.has(this.getItemId(item)),
      )
    );
  }

  get someSelected(): boolean {
    return this.selectedItems.size > 0 && !this.allSelected;
  }

  get totalColumns(): number {
    let count = this.columns.length;
    if (this.config?.selectable) count++;
    if (this.actions?.length) count++;
    return count;
  }
}
