import {
  ChangeDetectionStrategy, Component, OnInit, computed, inject, signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe, CurrencyPipe } from '@angular/common';
import {
  LucidePlus, LucideSearch, LucideFilter, LucideDownload, LucideEdit2,
  LucideTrash2, LucidePackage, LucideAlertTriangle, LucideCheckCircle, LucideXCircle,
  LucideMoreVertical, LucideEye, LucideCopy, LucideArchive,
} from '@lucide/angular';
import { LayoutService } from '../../core/services/layout.service';
import { ToastService } from '../../core/services/toast.service';
import { BadgeComponent, BadgeVariant } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../shared/components/dropdown/dropdown-item.component';
import { DropdownSeparatorComponent } from '../../shared/components/dropdown/dropdown-separator.component';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  comparePrice?: number;
  stock: number;
  status: 'active' | 'draft' | 'archived';
  image?: string;
  sales: number;
  revenue: number;
}

@Component({
  selector: 'app-products',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, RouterLink, DecimalPipe, CurrencyPipe,
    BadgeComponent, ButtonComponent, AvatarComponent,
    SkeletonComponent, EmptyStateComponent, PaginationComponent,
    StatCardComponent, ModalComponent,
    DropdownComponent, DropdownItemComponent, DropdownSeparatorComponent,
    LucidePlus, LucideSearch, LucideFilter, LucideDownload, LucideEdit2,
    LucideTrash2, LucidePackage, LucideAlertTriangle, LucideCheckCircle, LucideXCircle,
    LucideMoreVertical, LucideEye, LucideCopy, LucideArchive,
  ],
  template: `
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold text-[var(--color-text-primary)]">Products</h1>
        <p class="text-sm text-[var(--color-text-secondary)] mt-0.5">Manage your product catalog and inventory</p>
      </div>
      <div class="flex items-center gap-2">
        <ui-button variant="outline" size="sm" (click)="exportProducts()">
          <svg lucideDownload prefix [size]="14" color="currentColor" />
          Export
        </ui-button>
        <ui-button variant="primary" [routerLink]="['/products/new']">
          <svg lucidePlus prefix [size]="14" color="currentColor" />
          Add Product
        </ui-button>
      </div>
    </div>

    <!-- KPI Stats -->
    @if (!loading()) {
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-[var(--radius)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 flex items-center justify-center">
              <svg lucidePackage [size]="16" color="currentColor" class="text-[var(--color-primary-600)]" />
            </div>
            <div>
              <div class="text-2xl font-bold text-[var(--color-text-primary)]">{{ allProducts().length }}</div>
              <div class="text-xs text-[var(--color-text-muted)]">Total Products</div>
            </div>
          </div>
        </div>
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-[var(--radius)] bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <svg lucideCheckCircle [size]="16" color="currentColor" class="text-emerald-600" />
            </div>
            <div>
              <div class="text-2xl font-bold text-[var(--color-text-primary)]">{{ activeCount() }}</div>
              <div class="text-xs text-[var(--color-text-muted)]">Active</div>
            </div>
          </div>
        </div>
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-[var(--radius)] bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <svg lucideAlertTriangle [size]="16" color="currentColor" class="text-amber-600" />
            </div>
            <div>
              <div class="text-2xl font-bold text-[var(--color-text-primary)]">{{ lowStockCount() }}</div>
              <div class="text-xs text-[var(--color-text-muted)]">Low Stock</div>
            </div>
          </div>
        </div>
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-[var(--radius)] bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <svg lucideXCircle [size]="16" color="currentColor" class="text-red-600" />
            </div>
            <div>
              <div class="text-2xl font-bold text-[var(--color-text-primary)]">{{ outOfStockCount() }}</div>
              <div class="text-xs text-[var(--color-text-muted)]">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Filter bar -->
    <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4 mb-5">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-52">
          <svg lucideSearch class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" [size]="14" color="currentColor" />
          <input [(ngModel)]="searchQuery" placeholder="Search products…"
            class="w-full pl-9 pr-4 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                   bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
                   focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]" />
        </div>
        <select [(ngModel)]="categoryFilter"
          class="px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                 bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]
                 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]">
          <option value="">All Categories</option>
          @for (cat of categories; track cat) {
            <option [value]="cat">{{ cat }}</option>
          }
        </select>
        <select [(ngModel)]="statusFilter"
          class="px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                 bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]
                 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select [(ngModel)]="stockFilter"
          class="px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                 bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]
                 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]">
          <option value="">All Stock</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock (≤10)</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
        @if (searchQuery || categoryFilter || statusFilter || stockFilter) {
          <ui-button variant="ghost" size="sm" (click)="clearFilters()">Clear filters</ui-button>
        }
        <div class="ml-auto text-sm text-[var(--color-text-muted)]">{{ filteredProducts().length }} products</div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden">
      @if (loading()) {
        <div class="p-4 space-y-1">
          @for (i of [1,2,3,4,5,6]; track i) { <ui-skeleton type="row" /> }
        </div>
      } @else if (pagedProducts().length === 0) {
        <ui-empty-state title="No products found" description="Try adjusting your search or filters" actionLabel="Clear filters" (action)="clearFilters()" />
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-[var(--color-neutral-50)] dark:bg-[var(--color-bg-elevated)]">
              <tr>
                <th class="w-10 px-4 py-3">
                  <input type="checkbox" class="rounded border-[var(--color-border)] accent-[var(--color-primary-600)]"
                         [checked]="allSelected()" (change)="toggleAll($event)" />
                </th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Product</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">SKU</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Category</th>
                <th class="text-right text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Price</th>
                <th class="text-right text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Stock</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Status</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-border)]">
              @for (product of pagedProducts(); track product.id) {
                <tr class="hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors group"
                    [class.bg-[var(--color-primary-50)]]="selectedIds().has(product.id)"
                    [class.dark:bg-[var(--color-primary-900)]/10]="selectedIds().has(product.id)">
                  <td class="px-4 py-3">
                    <input type="checkbox" class="rounded border-[var(--color-border)] accent-[var(--color-primary-600)]"
                           [checked]="selectedIds().has(product.id)"
                           (change)="toggleSelect(product.id, $event)" />
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-[var(--radius)] bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)]
                                  flex items-center justify-center text-[var(--color-text-muted)] shrink-0 overflow-hidden">
                        <svg lucidePackage [size]="18" color="currentColor" />
                      </div>
                      <div>
                        <div class="text-sm font-medium text-[var(--color-text-primary)]">{{ product.name }}</div>
                        <div class="text-xs text-[var(--color-text-muted)]">{{ product.sales | number }} sold · {{ product.revenue | currency }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm font-mono text-[var(--color-text-muted)]">{{ product.sku }}</td>
                  <td class="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{{ product.category }}</td>
                  <td class="px-4 py-3 text-right">
                    <div class="text-sm font-semibold text-[var(--color-text-primary)]">{{ product.price | currency }}</div>
                    @if (product.comparePrice) {
                      <div class="text-xs text-[var(--color-text-muted)] line-through">{{ product.comparePrice | currency }}</div>
                    }
                  </td>
                  <td class="px-4 py-3 text-right">
                    <span [class]="stockClass(product.stock)" class="text-sm font-medium">{{ product.stock }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <ui-badge [variant]="statusVariant(product.status)" size="sm" [dot]="true">
                      {{ product.status | titlecase }}
                    </ui-badge>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <ui-dropdown placement="bottom-end" minWidth="188px">

                      <!-- Trigger: three-dot button, visible on row hover -->
                      <button trigger type="button"
                        class="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)]
                               hover:text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)]
                               dark:hover:bg-[var(--color-bg-elevated)] transition-colors
                               opacity-0 group-hover:opacity-100">
                        <svg lucideMoreVertical [size]="14" color="currentColor" />
                      </button>

                      <ui-dropdown-item (click)="editProduct(product)">
                        <svg lucideEdit2 [size]="14" color="currentColor" />
                        Edit
                      </ui-dropdown-item>
                      <ui-dropdown-item (click)="viewProduct(product)">
                        <svg lucideEye [size]="14" color="currentColor" />
                        View Details
                      </ui-dropdown-item>
                      <ui-dropdown-item (click)="duplicateProduct(product)">
                        <svg lucideCopy [size]="14" color="currentColor" />
                        Duplicate
                      </ui-dropdown-item>

                      <ui-dropdown-separator />

                      <ui-dropdown-item (click)="archiveProduct(product)" [disabled]="product.status === 'archived'">
                        <svg lucideArchive [size]="14" color="currentColor" />
                        Archive
                      </ui-dropdown-item>

                      <ui-dropdown-separator />

                      <ui-dropdown-item [danger]="true" (click)="deleteProduct(product)">
                        <svg lucideTrash2 [size]="14" color="currentColor" />
                        Delete
                      </ui-dropdown-item>

                    </ui-dropdown>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Bulk actions bar -->
        @if (selectedIds().size > 0) {
          <div class="px-6 py-3 bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/10 border-t border-[var(--color-border)]
                      flex items-center gap-3">
            <span class="text-sm font-medium text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]">
              {{ selectedIds().size }} selected
            </span>
            <ui-button variant="outline" size="sm" (click)="bulkStatusChange('active')">Set Active</ui-button>
            <ui-button variant="outline" size="sm" (click)="bulkStatusChange('archived')">Archive</ui-button>
            <ui-button variant="ghost" size="sm" (click)="clearSelection()">Clear</ui-button>
          </div>
        }

        <div class="px-6 py-4 border-t border-[var(--color-border)]">
          <ui-pagination [page]="currentPage()" [pageSize]="pageSize" [total]="filteredProducts().length" (pageChange)="currentPage.set($event)" />
        </div>
      }
    </div>

    <!-- Delete confirm modal -->
    @if (deleteTarget()) {
      <ui-modal title="Delete Product" subtitle="This action cannot be undone." size="sm" (close)="deleteTarget.set(null)">
        <p class="text-sm text-[var(--color-text-secondary)]">
          Are you sure you want to delete <strong class="text-[var(--color-text-primary)]">{{ deleteTarget()?.name }}</strong>?
          All associated data will be permanently removed.
        </p>
        <div modal-footer>
          <ui-button variant="outline" (click)="deleteTarget.set(null)">Cancel</ui-button>
          <ui-button variant="danger" (click)="confirmDelete()">Delete Product</ui-button>
        </div>
      </ui-modal>
    }
  `
})
export class ProductsComponent implements OnInit {
  private layout = inject(LayoutService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(true);
  currentPage = signal(1);
  pageSize = 10;
  searchQuery = '';
  categoryFilter = '';
  statusFilter = '';
  stockFilter = '';
  selectedIds = signal<Set<number>>(new Set());
  deleteTarget = signal<Product | null>(null);

  categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Software'];

  allProducts = signal<Product[]>([
    { id: 1, name: 'Pro Analytics Suite', sku: 'SFT-001', category: 'Software', price: 299, comparePrice: 399, stock: 999, status: 'active', sales: 1284, revenue: 383916 },
    { id: 2, name: 'Enterprise Dashboard', sku: 'SFT-002', category: 'Software', price: 599, comparePrice: 799, stock: 999, status: 'active', sales: 382, revenue: 228818 },
    { id: 3, name: 'Wireless Noise-Cancel Headphones', sku: 'ELC-001', category: 'Electronics', price: 249.99, comparePrice: 349.99, stock: 47, status: 'active', sales: 891, revenue: 222740 },
    { id: 4, name: 'Ergonomic Standing Desk', sku: 'HMG-001', category: 'Home & Garden', price: 649, comparePrice: 849, stock: 8, status: 'active', sales: 234, revenue: 151866 },
    { id: 5, name: 'Performance Running Shoes', sku: 'SPT-001', category: 'Sports', price: 129.99, comparePrice: 159.99, stock: 3, status: 'active', sales: 567, revenue: 73694 },
    { id: 6, name: 'Mechanical Keyboard RGB', sku: 'ELC-002', category: 'Electronics', price: 179.99, stock: 62, status: 'active', sales: 423, revenue: 76136 },
    { id: 7, name: 'Premium Yoga Mat', sku: 'SPT-002', category: 'Sports', price: 79.99, stock: 0, status: 'active', sales: 789, revenue: 63111 },
    { id: 8, name: 'Smart Home Hub', sku: 'ELC-003', category: 'Electronics', price: 149.99, comparePrice: 199.99, stock: 24, status: 'active', sales: 312, revenue: 46796 },
    { id: 9, name: 'Leather Laptop Bag', sku: 'CLT-001', category: 'Clothing', price: 89.99, stock: 5, status: 'draft', sales: 0, revenue: 0 },
    { id: 10, name: 'Bamboo Desk Organizer', sku: 'HMG-002', category: 'Home & Garden', price: 44.99, stock: 156, status: 'active', sales: 678, revenue: 30503 },
    { id: 11, name: 'JavaScript: The Good Parts', sku: 'BKS-001', category: 'Books', price: 34.99, stock: 0, status: 'active', sales: 1102, revenue: 38562 },
    { id: 12, name: 'Starter Pack Bundle', sku: 'SFT-003', category: 'Software', price: 49, stock: 999, status: 'archived', sales: 2140, revenue: 104860 },
    { id: 13, name: 'Portable SSD 1TB', sku: 'ELC-004', category: 'Electronics', price: 119.99, comparePrice: 149.99, stock: 31, status: 'active', sales: 456, revenue: 54715 },
    { id: 14, name: 'Monitor Light Bar', sku: 'ELC-005', category: 'Electronics', price: 59.99, stock: 7, status: 'active', sales: 234, revenue: 14037 },
    { id: 15, name: 'Resistance Band Set', sku: 'SPT-003', category: 'Sports', price: 29.99, stock: 89, status: 'draft', sales: 0, revenue: 0 },
  ]);

  filteredProducts = computed(() => {
    const q = this.searchQuery.toLowerCase();
    return this.allProducts().filter(p =>
      (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) &&
      (!this.categoryFilter || p.category === this.categoryFilter) &&
      (!this.statusFilter || p.status === this.statusFilter) &&
      (!this.stockFilter ||
        (this.stockFilter === 'in_stock' && p.stock > 10) ||
        (this.stockFilter === 'low_stock' && p.stock > 0 && p.stock <= 10) ||
        (this.stockFilter === 'out_of_stock' && p.stock === 0)
      )
    );
  });

  pagedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredProducts().slice(start, start + this.pageSize);
  });

  activeCount = computed(() => this.allProducts().filter(p => p.status === 'active').length);
  lowStockCount = computed(() => this.allProducts().filter(p => p.stock > 0 && p.stock <= 10).length);
  outOfStockCount = computed(() => this.allProducts().filter(p => p.stock === 0).length);
  allSelected = computed(() => this.pagedProducts().length > 0 && this.pagedProducts().every(p => this.selectedIds().has(p.id)));

  ngOnInit() {
    this.layout.setPage('Products', [{ label: 'Management' }, { label: 'Products' }]);
    setTimeout(() => this.loading.set(false), 400);
  }

  statusVariant(status: string): BadgeVariant {
    return ({ active: 'success', draft: 'neutral', archived: 'warning' } as Record<string, BadgeVariant>)[status] ?? 'neutral';
  }

  stockClass(stock: number): string {
    if (stock === 0) return 'text-red-600 dark:text-red-400';
    if (stock <= 10) return 'text-amber-600 dark:text-amber-400';
    return 'text-[var(--color-text-primary)]';
  }

  clearFilters() { this.searchQuery = ''; this.categoryFilter = ''; this.statusFilter = ''; this.stockFilter = ''; this.currentPage.set(1); }

  toggleAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedIds.set(new Set(this.pagedProducts().map(p => p.id)));
    } else {
      this.clearSelection();
    }
  }

  toggleSelect(id: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedIds.update(set => {
      const next = new Set(set);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }

  clearSelection() { this.selectedIds.set(new Set()); }

  bulkStatusChange(status: 'active' | 'archived') {
    const count = this.selectedIds().size;
    this.allProducts.update(products =>
      products.map(p => this.selectedIds().has(p.id) ? { ...p, status } : p)
    );
    this.clearSelection();
    this.toast.success('Products updated', `${count} products set to ${status}.`);
  }

  editProduct(product: Product) { this.router.navigate(['/products', product.id]); }

  viewProduct(product: Product) { this.toast.info('View product', `Opening details for ${product.name}.`); }

  duplicateProduct(product: Product) {
    const copy: Product = { ...product, id: Date.now(), name: `${product.name} (Copy)`, sku: `${product.sku}-COPY`, status: 'draft', sales: 0, revenue: 0 };
    this.allProducts.update(p => [...p, copy]);
    this.toast.success('Product duplicated', `"${copy.name}" created as a draft.`);
  }

  archiveProduct(product: Product) {
    this.allProducts.update(p => p.map(x => x.id === product.id ? { ...x, status: 'archived' as const } : x));
    this.toast.success('Product archived', `${product.name} has been archived.`);
  }

  deleteProduct(product: Product) { this.deleteTarget.set(product); }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.allProducts.update(p => p.filter(x => x.id !== target.id));
    this.deleteTarget.set(null);
    this.toast.success('Product deleted', `${target.name} has been removed.`);
  }

  exportProducts() { this.toast.info('Export started', 'Your product catalog is being exported to CSV.'); }
}
