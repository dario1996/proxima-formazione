# DataTable Component - Radix UI Inspired

A reusable, feature-rich data table component that follows Radix UI design principles.

## Features

✅ **Radix UI Styling** - Clean, minimal, professional design  
✅ **Filtering** - Text search, dropdowns, checkboxes  
✅ **Sorting** - Click headers to sort columns  
✅ **Actions** - Customizable action buttons per row  
✅ **Selection** - Single/multi-row selection  
✅ **Loading States** - Built-in loading indicators  
✅ **Empty States** - Customizable empty data messages  
✅ **Responsive** - Mobile-friendly design  
✅ **Accessible** - Proper ARIA labels and keyboard navigation  
✅ **Type-Safe** - Full TypeScript support

## Basic Usage

```typescript
import {
  DataTableComponent,
  TableColumn,
  TableAction,
  TableFilter,
  TableConfig,
} from './data-table.component';

@Component({
  template: `
    <app-data-table
      [data]="employees"
      [columns]="columns"
      [actions]="actions"
      [filters]="filters"
      [config]="config"
      (rowClick)="onRowClick($event)"
      (filterChange)="onFilterChange($event)"
      (sortChange)="onSortChange($event)"
    >
    </app-data-table>
  `,
  imports: [DataTableComponent],
})
export class MyComponent {
  employees = [
    { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false },
  ];

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'active', label: 'Status', type: 'badge' },
  ];

  actions: TableAction[] = [
    {
      label: 'Edit',
      icon: 'edit',
      type: 'primary',
      handler: item => this.edit(item),
    },
    {
      label: 'Delete',
      icon: 'delete',
      type: 'danger',
      handler: item => this.delete(item),
    },
  ];

  filters: TableFilter[] = [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search employees...',
    },
    {
      key: 'active',
      label: 'Active Only',
      type: 'checkbox',
    },
  ];

  config: TableConfig = {
    clickableRows: true,
    filterable: true,
    emptyMessage: 'No employees found',
  };
}
```

## Column Types

### Text Column

```typescript
{ key: 'name', label: 'Name', type: 'text', sortable: true }
```

### Badge Column

```typescript
{ key: 'status', label: 'Status', type: 'badge', sortable: true }
```

### Custom Template Column

```typescript
{
  key: 'custom',
  label: 'Custom',
  type: 'custom',
  customTemplate: myTemplateRef
}
```

## Action Types

- `primary` - Blue button for main actions
- `secondary` - Gray button for secondary actions
- `danger` - Red button for delete/dangerous actions
- `warning` - Yellow button for warning actions
- `success` - Green button for positive actions

## Filter Types

### Text Search

```typescript
{
  key: 'search',
  label: 'Search',
  type: 'text',
  placeholder: 'Search...'
}
```

### Dropdown Select

```typescript
{
  key: 'category',
  label: 'Category',
  type: 'select',
  options: [
    { value: 'tech', label: 'Technology' },
    { value: 'sales', label: 'Sales' }
  ]
}
```

### Checkbox

```typescript
{
  key: 'active',
  label: 'Active Only',
  type: 'checkbox'
}
```

## Events

### Row Click

```typescript
(rowClick)="onRowClick($event)"

onRowClick(item: any) {
  console.log('Clicked row:', item);
}
```

### Filter Change

```typescript
(filterChange)="onFilterChange($event)"

onFilterChange(filters: any) {
  console.log('Filters:', filters);
}
```

### Sort Change

```typescript
(sortChange)="onSortChange($event)"

onSortChange(sort: { column: string; direction: 'asc' | 'desc' }) {
  console.log('Sort:', sort);
}
```

## Migration from Bootstrap Tables

### Before (Bootstrap)

```html
<table class="table table-hover">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let item of items">
      <td>{{ item.name }}</td>
      <td>{{ item.email }}</td>
      <td>
        <button class="btn btn-primary" (click)="edit(item)">Edit</button>
        <button class="btn btn-danger" (click)="delete(item)">Delete</button>
      </td>
    </tr>
  </tbody>
</table>
```

### After (DataTable)

```html
<app-data-table [data]="items" [columns]="columns" [actions]="actions">
</app-data-table>
```

```typescript
columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
];

actions = [
  {
    label: 'Edit',
    icon: 'edit',
    type: 'primary',
    handler: item => this.edit(item),
  },
  {
    label: 'Delete',
    icon: 'delete',
    type: 'danger',
    handler: item => this.delete(item),
  },
];
```

## Styling

The component uses CSS custom properties from our global design system:

- `--color-background`
- `--color-foreground`
- `--color-border`
- `--color-primary`
- `--spacing-*`
- `--radius-*`

All styling follows Radix UI principles for consistency across the application.

## Performance

- Virtual scrolling for large datasets (planned)
- Efficient change detection with OnPush
- Memoized filter and sort operations
- Lazy loading support (planned)
