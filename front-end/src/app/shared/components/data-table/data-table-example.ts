// EXAMPLE: How to migrate Dipendenti component to use the new DataTable

import { Component } from '@angular/core';
import {
  DataTableComponent,
  TableColumn,
  TableAction,
  TableFilter,
  TableConfig,
} from './data-table.component';

@Component({
  selector: 'app-dipendenti-with-data-table',
  template: `
    <div class="container-fluid">
      <app-page-title [title]="title" [icon]="icon"></app-page-title>

      <!-- Use the new DataTable component -->
      <app-data-table
        [data]="dipendenti"
        [columns]="columns"
        [actions]="actions"
        [filters]="filters"
        [config]="tableConfig"
        (rowClick)="openDetailModal($event)"
        (filterChange)="onFilterChange($event)"
        (sortChange)="onSortChange($event)"
      ></app-data-table>
    </div>
  `,
  imports: [DataTableComponent],
})
export class DipendentiWithDataTableComponent {
  title = 'Dipendenti';
  icon = 'fa-solid fa-users';

  dipendenti: any[] = []; // Your existing data

  // Define table columns
  columns: TableColumn[] = [
    {
      key: 'codiceDipendente',
      label: 'Codice',
      sortable: true,
      type: 'text',
    },
    {
      key: 'nomeCompleto', // You can create computed properties
      label: 'Nome Completo',
      sortable: true,
      type: 'custom',
      customTemplate: this.nomeCompletoTemplate, // Define template ref
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      type: 'text',
    },
    {
      key: 'reparto',
      label: 'Reparto',
      sortable: true,
      type: 'text',
    },
    {
      key: 'commerciale',
      label: 'Area Commerciale',
      sortable: true,
      type: 'text',
    },
    {
      key: 'ruolo',
      label: 'Ruolo',
      sortable: true,
      type: 'text',
    },
    {
      key: 'attivo',
      label: 'Stato',
      sortable: true,
      type: 'badge',
    },
  ];

  // Define table actions
  actions: TableAction[] = [
    {
      label: 'Modifica',
      icon: 'edit',
      type: 'primary',
      handler: item => this.modifica(item.id),
    },
    {
      label: 'Toggle Status',
      icon: 'toggle',
      type: 'warning',
      handler: item => this.toggleStatus(item.id),
      // Dynamic button based on status
      visible: item => true,
    },
    {
      label: 'Elimina',
      icon: 'delete',
      type: 'danger',
      handler: item => this.removePermanent(item.id),
    },
  ];

  // Define filters
  filters: TableFilter[] = [
    {
      key: 'search',
      label: 'Cerca',
      type: 'text',
      placeholder: 'Nome, cognome, email o codice...',
    },
    {
      key: 'reparto',
      label: 'Reparto',
      type: 'select',
      options: [], // Will be populated dynamically
    },
    {
      key: 'commerciale',
      label: 'Area Commerciale',
      type: 'select',
      options: [], // Will be populated dynamically
    },
    {
      key: 'soloAttivi',
      label: 'Solo Attivi',
      type: 'checkbox',
    },
  ];

  // Table configuration
  tableConfig: TableConfig = {
    searchable: true,
    filterable: true,
    clickableRows: true,
    emptyMessage: 'Nessun dipendente trovato con i filtri applicati',
    loading: false,
  };

  // Event handlers - preserve your existing logic
  onFilterChange(filterValues: any) {
    // Your existing filter logic here
    console.log('Filters changed:', filterValues);
  }

  onSortChange(sortInfo: { column: string; direction: 'asc' | 'desc' }) {
    // Handle sorting if needed
    console.log('Sort changed:', sortInfo);
  }

  openDetailModal(dipendente: any) {
    // Your existing modal logic
    console.log('Row clicked:', dipendente);
  }

  modifica(id: number) {
    // Your existing edit logic
  }

  toggleStatus(id: number) {
    // Your existing toggle logic
  }

  removePermanent(id: number) {
    // Your existing delete logic
  }

  // Helper method to prepare data
  private prepareTableData() {
    // Transform your data if needed
    this.dipendenti = this.dipendenti.map(d => ({
      ...d,
      nomeCompleto: `${d.nome} ${d.cognome}`,
      // Add any other computed properties
    }));

    // Update filter options
    this.updateFilterOptions();
  }

  private updateFilterOptions() {
    // Update reparto options
    const repartoFilter = this.filters.find(f => f.key === 'reparto');
    if (repartoFilter) {
      const reparti = [
        ...new Set(this.dipendenti.map(d => d.reparto).filter(r => r)),
      ];
      repartoFilter.options = reparti.map(r => ({ value: r, label: r }));
    }

    // Update commerciale options
    const commercialeFilter = this.filters.find(f => f.key === 'commerciale');
    if (commercialeFilter) {
      const commerciali = [
        ...new Set(this.dipendenti.map(d => d.commerciale).filter(c => c)),
      ];
      commercialeFilter.options = commerciali.map(c => ({
        value: c,
        label: c,
      }));
    }
  }
}

/* 
  MIGRATION STEPS:

  1. Replace your existing table HTML with:
     <app-data-table [data]="data" [columns]="columns" [actions]="actions" [filters]="filters" [config]="config">

  2. Define your columns, actions, and filters as shown above

  3. Move your existing logic to the event handlers

  4. Keep all your existing services and business logic intact

  5. The component will handle:
     - Filtering
     - Sorting  
     - Row selection
     - Loading states
     - Empty states
     - Responsive design
     - Radix UI styling

  BENEFITS:
  ✅ Consistent Radix UI design across all tables
  ✅ Reusable across different entities (dipendenti, corsi, etc.)
  ✅ Built-in filtering, sorting, and pagination
  ✅ Responsive design
  ✅ Type-safe with TypeScript
  ✅ Preserves all existing business logic
  ✅ Easy to extend and customize
*/
