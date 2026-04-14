import {
  ChangeDetectionStrategy, Component, OnInit, computed, inject, signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import {
  LucidePlus, LucideSearch, LucideEdit2, LucideTrash2, LucideTag,
  LucideFolderTree, LucideGrid2x2, LucideList, LucideMoreVertical, LucideEye,
} from '@lucide/angular';
import { LayoutService } from '../../core/services/layout.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/form/input/input.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../shared/components/dropdown/dropdown-item.component';
import { DropdownSeparatorComponent } from '../../shared/components/dropdown/dropdown-separator.component';

type StatusTab = 'all' | 'active' | 'inactive';
type ViewMode = 'grid' | 'table';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  color: string;
  status: 'active' | 'inactive';
  parentId?: number;
}

@Component({
  selector: 'app-product-categories',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, TitleCasePipe,
    ButtonComponent, InputComponent, BadgeComponent, ModalComponent,
    EmptyStateComponent, PaginationComponent,
    DropdownComponent, DropdownItemComponent, DropdownSeparatorComponent,
    LucidePlus, LucideSearch, LucideEdit2, LucideTrash2, LucideTag,
    LucideFolderTree, LucideGrid2x2, LucideList, LucideMoreVertical, LucideEye,
  ],
  template: `
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold text-[var(--color-text-primary)]">Categories</h1>
        <p class="text-sm text-[var(--color-text-secondary)] mt-0.5">Organise your products into categories</p>
      </div>
      <ui-button variant="primary" (click)="openModal()">
        <svg lucidePlus prefix [size]="14" color="currentColor" />
        Add Category
      </ui-button>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4 flex items-center gap-3">
        <div class="w-9 h-9 rounded-[var(--radius)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 flex items-center justify-center">
          <svg lucideFolderTree [size]="16" color="currentColor" class="text-[var(--color-primary-600)]" />
        </div>
        <div>
          <div class="text-xl font-bold text-[var(--color-text-primary)]">{{ categories().length }}</div>
          <div class="text-xs text-[var(--color-text-muted)]">Total Categories</div>
        </div>
      </div>
      <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4 flex items-center gap-3">
        <div class="w-9 h-9 rounded-[var(--radius)] bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
          <svg lucideTag [size]="16" color="currentColor" class="text-emerald-600" />
        </div>
        <div>
          <div class="text-xl font-bold text-[var(--color-text-primary)]">{{ activeCount() }}</div>
          <div class="text-xs text-[var(--color-text-muted)]">Active</div>
        </div>
      </div>
      <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4 flex items-center gap-3">
        <div class="w-9 h-9 rounded-[var(--radius)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 flex items-center justify-center">
          <svg lucideTag [size]="16" color="currentColor" class="text-[var(--color-primary-600)]" />
        </div>
        <div>
          <div class="text-xl font-bold text-[var(--color-text-primary)]">{{ totalProducts() }}</div>
          <div class="text-xs text-[var(--color-text-muted)]">Total Products</div>
        </div>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4 mb-5">

      <!-- Status tabs (pill style) -->
      <div class="flex items-center gap-1 bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)] rounded-[var(--radius)] p-1 mb-3">
        @for (tab of statusTabs; track tab.value) {
          <button (click)="statusTab.set(tab.value)"
            class="px-3 py-1 text-xs font-medium rounded-[var(--radius-sm)] transition-colors"
            [class.bg-white]="statusTab() === tab.value"
            [class.dark:bg-[var(--color-bg-surface)]]="statusTab() === tab.value"
            [class.shadow-[var(--shadow-card)]]="statusTab() === tab.value"
            [class.text-[var(--color-text-primary)]]="statusTab() === tab.value"
            [class.text-[var(--color-text-muted)]]="statusTab() !== tab.value"
            [class.hover:text-[var(--color-text-primary)]]="statusTab() !== tab.value">
            {{ tab.label }}
            <span class="ml-1 text-[10px] text-[var(--color-text-muted)]">{{ tabCount(tab.value) }}</span>
          </button>
        }
      </div>

      <!-- Search, Sort & View Toggle -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search -->
        <div class="relative flex-1 min-w-48">
          <svg lucideSearch class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" [size]="13" color="currentColor" />
          <input [(ngModel)]="searchQuery" placeholder="Search categories…"
            class="w-full pl-8 pr-4 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                   bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
                   focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]" />
        </div>

        <!-- Sort -->
        <select [(ngModel)]="sortBy"
          class="px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                 bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]
                 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20">
          <option value="name_asc">Name A–Z</option>
          <option value="name_desc">Name Z–A</option>
          <option value="products_desc">Most Products</option>
          <option value="products_asc">Fewest Products</option>
        </select>

        <div class="ml-auto flex items-center gap-3">
          <!-- Count -->
          <span class="text-sm text-[var(--color-text-muted)]">{{ filtered().length }} categories</span>

          <!-- View toggle -->
          <div class="flex items-center gap-1 border border-[var(--color-border)] rounded-[var(--radius)] p-1">
            <button (click)="viewMode.set('grid')"
              class="p-1.5 rounded-[var(--radius-sm)] transition-colors"
              [class.bg-[var(--color-primary-100)]]="viewMode() === 'grid'"
              [class.dark:bg-[var(--color-primary-900)]/20]="viewMode() === 'grid'"
              [class.text-[var(--color-primary-600)]]="viewMode() === 'grid'"
              [class.text-[var(--color-text-muted)]]="viewMode() !== 'grid'"
              title="Grid view">
              <svg lucideGrid2x2 [size]="14" color="currentColor" />
            </button>
            <button (click)="viewMode.set('table')"
              class="p-1.5 rounded-[var(--radius-sm)] transition-colors"
              [class.bg-[var(--color-primary-100)]]="viewMode() === 'table'"
              [class.dark:bg-[var(--color-primary-900)]/20]="viewMode() === 'table'"
              [class.text-[var(--color-primary-600)]]="viewMode() === 'table'"
              [class.text-[var(--color-text-muted)]]="viewMode() !== 'table'"
              title="Table view">
              <svg lucideList [size]="14" color="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </div>

    @if (filtered().length === 0) {
      <ui-empty-state title="No categories found" description="Create your first category to organise your products" actionLabel="Add Category" (action)="openModal()" />
    } @else {

      <!-- ── Grid View ──────────────────────────────────────────────── -->
      @if (viewMode() === 'grid') {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (cat of pagedItems(); track cat.id) {
            <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]
                        hover:shadow-[var(--shadow-elevated)] transition-shadow">
              <!-- Color strip + header -->
              <div class="h-1.5 rounded-t-[var(--radius-lg)]" [style.background]="cat.color"></div>
              <div class="p-5">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-[var(--radius)] flex items-center justify-center" [style.background]="cat.color + '20'">
                      <svg lucideTag [size]="16" color="currentColor" [style.color]="cat.color" />
                    </div>
                    <div>
                      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">{{ cat.name }}</h3>
                      <span class="text-xs text-[var(--color-text-muted)] font-mono">/{{ cat.slug }}</span>
                    </div>
                  </div>
                  <ui-badge [variant]="cat.status === 'active' ? 'success' : 'neutral'" size="sm">
                    {{ cat.status | titlecase }}
                  </ui-badge>
                </div>

                <p class="text-xs text-[var(--color-text-muted)] mb-4 line-clamp-2 min-h-[2rem]">
                  {{ cat.description || 'No description provided.' }}
                </p>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <svg lucideTag [size]="12" color="currentColor" class="text-[var(--color-text-muted)]" />
                    <span class="text-sm font-medium text-[var(--color-text-primary)]">{{ cat.productCount }}</span>
                    <span class="text-xs text-[var(--color-text-muted)]">products</span>
                  </div>

                  <!-- Always-visible action dropdown -->
                  <ui-dropdown placement="bottom-end" minWidth="180px">
                    <button trigger type="button"
                      class="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)]
                             hover:text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)]
                             dark:hover:bg-[var(--color-bg-elevated)] transition-colors">
                      <svg lucideMoreVertical [size]="14" color="currentColor" />
                    </button>
                    <ui-dropdown-item (click)="viewCategory(cat)">
                      <svg lucideEye [size]="14" color="currentColor" />
                      View Products
                    </ui-dropdown-item>
                    <ui-dropdown-item (click)="editCategory(cat)">
                      <svg lucideEdit2 [size]="14" color="currentColor" />
                      Edit
                    </ui-dropdown-item>
                    <ui-dropdown-separator />
                    <ui-dropdown-item [danger]="true" (click)="deleteCategory(cat)">
                      <svg lucideTrash2 [size]="14" color="currentColor" />
                      Delete
                    </ui-dropdown-item>
                  </ui-dropdown>
                </div>
              </div>
            </div>
          }

          <!-- Add new card -->
          <button (click)="openModal()"
            class="bg-[var(--color-bg-surface)] border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)]
                   p-5 flex flex-col items-center justify-center gap-2 min-h-[160px]
                   hover:border-[var(--color-primary-400)] hover:bg-[var(--color-primary-50)] dark:hover:bg-[var(--color-primary-900)]/5
                   transition-colors group cursor-pointer">
            <div class="w-10 h-10 rounded-full bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)]
                        flex items-center justify-center group-hover:bg-[var(--color-primary-100)] dark:group-hover:bg-[var(--color-primary-900)]/20 transition-colors">
              <svg lucidePlus [size]="20" color="currentColor" class="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-600)] transition-colors" />
            </div>
            <span class="text-sm font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-600)] transition-colors">Add Category</span>
          </button>
        </div>

        <!-- Grid pagination -->
        @if (filtered().length > pageSize) {
          <div class="mt-6 pt-4 border-t border-[var(--color-border)]">
            <ui-pagination [page]="currentPage()" [pageSize]="pageSize" [total]="filtered().length" (pageChange)="currentPage.set($event)" />
          </div>
        }
      }

      <!-- ── Table View ─────────────────────────────────────────────── -->
      @if (viewMode() === 'table') {
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-[var(--color-neutral-50)] dark:bg-[var(--color-bg-elevated)]">
                <tr>
                  <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Category</th>
                  <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Description</th>
                  <th class="text-right text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Products</th>
                  <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Status</th>
                  <th class="px-6 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--color-border)]">
                @for (cat of pagedItems(); track cat.id) {
                  <tr class="hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <!-- Color swatch -->
                        <div class="w-8 h-8 rounded-[var(--radius)] flex items-center justify-center shrink-0"
                             [style.background]="cat.color + '20'">
                          <div class="w-3 h-3 rounded-full" [style.background]="cat.color"></div>
                        </div>
                        <div>
                          <div class="text-sm font-semibold text-[var(--color-text-primary)]">{{ cat.name }}</div>
                          <div class="text-xs text-[var(--color-text-muted)] font-mono">/{{ cat.slug }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <p class="text-sm text-[var(--color-text-muted)] max-w-xs truncate">
                        {{ cat.description || '—' }}
                      </p>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <span class="text-sm font-medium text-[var(--color-text-primary)]">{{ cat.productCount }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <ui-badge [variant]="cat.status === 'active' ? 'success' : 'neutral'" size="sm" [dot]="true">
                        {{ cat.status | titlecase }}
                      </ui-badge>
                    </td>
                    <!-- Always-visible action dropdown -->
                    <td class="px-6 py-4 text-right">
                      <ui-dropdown placement="bottom-end" minWidth="180px">
                        <button trigger type="button"
                          class="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)]
                                 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)]
                                 dark:hover:bg-[var(--color-bg-elevated)] transition-colors">
                          <svg lucideMoreVertical [size]="14" color="currentColor" />
                        </button>
                        <ui-dropdown-item (click)="viewCategory(cat)">
                          <svg lucideEye [size]="14" color="currentColor" />
                          View Products
                        </ui-dropdown-item>
                        <ui-dropdown-item (click)="editCategory(cat)">
                          <svg lucideEdit2 [size]="14" color="currentColor" />
                          Edit
                        </ui-dropdown-item>
                        <ui-dropdown-separator />
                        <ui-dropdown-item [danger]="true" (click)="deleteCategory(cat)">
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
          <!-- Table pagination -->
          <div class="px-6 py-4 border-t border-[var(--color-border)]">
            <ui-pagination [page]="currentPage()" [pageSize]="pageSize" [total]="filtered().length" (pageChange)="currentPage.set($event)" />
          </div>
        </div>
      }
    }

    <!-- Add / Edit Modal -->
    @if (showModal()) {
      <ui-modal [title]="editingCategory() ? 'Edit Category' : 'Add Category'" subtitle="Organise products into groups" size="md" (close)="closeModal()">
        <div class="space-y-4">
          <ui-input label="Name" placeholder="e.g. Electronics" [(value)]="modalForm.name" [required]="true" />
          <ui-input label="Slug" placeholder="auto-generated" [(value)]="modalForm.slug" />
          <div>
            <label class="text-sm font-medium text-[var(--color-text-primary)] block mb-1.5">Description</label>
            <textarea [(ngModel)]="modalForm.description" rows="2" placeholder="Short description (optional)"
              class="w-full px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                     bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] resize-none">
            </textarea>
          </div>
          <div>
            <label class="text-sm font-medium text-[var(--color-text-primary)] block mb-1.5">Color</label>
            <div class="flex items-center gap-3 flex-wrap">
              @for (color of colorOptions; track color) {
                <button (click)="modalForm.color = color" [title]="color"
                  class="w-7 h-7 rounded-full border-2 transition-all"
                  [class.border-[var(--color-text-primary)]]="modalForm.color === color"
                  [class.border-transparent]="modalForm.color !== color"
                  [class.scale-125]="modalForm.color === color"
                  [style.background]="color">
                </button>
              }
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-[var(--color-text-primary)] block mb-1.5">Status</label>
            <select [(ngModel)]="modalForm.status"
              class="w-full px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                     bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div modal-footer>
          <ui-button variant="outline" (click)="closeModal()">Cancel</ui-button>
          <ui-button variant="primary" (click)="saveCategory()">
            {{ editingCategory() ? 'Save Changes' : 'Create Category' }}
          </ui-button>
        </div>
      </ui-modal>
    }
  `
})
export class ProductCategoriesComponent implements OnInit {
  private layout = inject(LayoutService);
  private toast = inject(ToastService);

  searchQuery = '';
  sortBy = 'name_asc';
  statusTab = signal<StatusTab>('all');
  viewMode = signal<ViewMode>('grid');
  showModal = signal(false);
  editingCategory = signal<Category | null>(null);
  currentPage = signal(1);
  pageSize = 9;

  statusTabs = [
    { label: 'All', value: 'all' as StatusTab },
    { label: 'Active', value: 'active' as StatusTab },
    { label: 'Inactive', value: 'inactive' as StatusTab },
  ];

  colorOptions = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  modalForm = { name: '', slug: '', description: '', color: '#4f46e5', status: 'active' as 'active' | 'inactive' };

  categories = signal<Category[]>([
    { id: 1, name: 'Electronics', slug: 'electronics', description: 'Gadgets, devices, and electronic accessories for home and office.', productCount: 24, color: '#4f46e5', status: 'active' },
    { id: 2, name: 'Software', slug: 'software', description: 'Digital products, SaaS subscriptions, and productivity tools.', productCount: 8, color: '#10b981', status: 'active' },
    { id: 3, name: 'Clothing', slug: 'clothing', description: 'Apparel, accessories, and fashion items for all occasions.', productCount: 16, color: '#f59e0b', status: 'active' },
    { id: 4, name: 'Home & Garden', slug: 'home-garden', description: 'Furniture, decor, and outdoor products to beautify your space.', productCount: 12, color: '#10b981', status: 'active' },
    { id: 5, name: 'Sports', slug: 'sports', description: 'Equipment and gear for fitness, outdoor sports, and recreation.', productCount: 18, color: '#3b82f6', status: 'active' },
    { id: 6, name: 'Books', slug: 'books', description: 'Physical and digital books across all genres and topics.', productCount: 6, color: '#8b5cf6', status: 'inactive' },
  ]);

  filtered = computed(() => {
    const q = this.searchQuery.toLowerCase();
    const tab = this.statusTab();
    let items = this.categories().filter(c =>
      (tab === 'all' || c.status === tab) &&
      (!q || c.name.toLowerCase().includes(q) || c.slug.includes(q))
    );

    // Sort
    const [field, dir] = this.sortBy.split('_');
    items = [...items].sort((a, b) => {
      const av = field === 'products' ? a.productCount : a.name.toLowerCase();
      const bv = field === 'products' ? b.productCount : b.name.toLowerCase();
      if (av < bv) return dir === 'asc' ? -1 : 1;
      if (av > bv) return dir === 'asc' ? 1 : -1;
      return 0;
    });

    return items;
  });

  pagedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  activeCount = computed(() => this.categories().filter(c => c.status === 'active').length);
  totalProducts = computed(() => this.categories().reduce((s, c) => s + c.productCount, 0));

  tabCount(tab: StatusTab): number {
    return tab === 'all' ? this.categories().length : this.categories().filter(c => c.status === tab).length;
  }

  ngOnInit() {
    this.layout.setPage('Categories', [{ label: 'Management' }, { label: 'Products', route: '/products' }, { label: 'Categories' }]);
  }

  openModal() { this.editingCategory.set(null); this.modalForm = { name: '', slug: '', description: '', color: '#4f46e5', status: 'active' }; this.showModal.set(true); }

  editCategory(cat: Category) {
    this.editingCategory.set(cat);
    this.modalForm = { name: cat.name, slug: cat.slug, description: cat.description, color: cat.color, status: cat.status };
    this.showModal.set(true);
  }

  viewCategory(cat: Category) { this.toast.info('View Products', `Showing products in "${cat.name}".`); }

  closeModal() { this.showModal.set(false); this.editingCategory.set(null); }

  saveCategory() {
    if (!this.modalForm.name) { this.toast.error('Validation error', 'Category name is required.'); return; }
    const slug = this.modalForm.slug || this.modalForm.name.toLowerCase().replace(/\s+/g, '-');
    if (this.editingCategory()) {
      this.categories.update(cats => cats.map(c =>
        c.id === this.editingCategory()!.id ? { ...c, ...this.modalForm, slug } : c
      ));
      this.toast.success('Category updated', `${this.modalForm.name} has been saved.`);
    } else {
      const newCat: Category = { id: Date.now(), ...this.modalForm, slug, productCount: 0 };
      this.categories.update(cats => [...cats, newCat]);
      this.toast.success('Category created', `${this.modalForm.name} is now available.`);
    }
    this.closeModal();
  }

  deleteCategory(cat: Category) {
    this.categories.update(cats => cats.filter(c => c.id !== cat.id));
    this.toast.success('Category deleted', `${cat.name} has been removed.`);
  }
}
