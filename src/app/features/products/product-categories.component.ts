import {
  ChangeDetectionStrategy, Component, OnInit, computed, inject, signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import {
  LucidePlus, LucideSearch, LucideEdit2, LucideTrash2, LucideTag, LucideFolderTree, LucideGripVertical
} from '@lucide/angular';
import { LayoutService } from '../../core/services/layout.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/form/input/input.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

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
    ButtonComponent, InputComponent, BadgeComponent, ModalComponent, EmptyStateComponent,
    LucidePlus, LucideSearch, LucideEdit2, LucideTrash2, LucideTag, LucideFolderTree, LucideGripVertical,
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

    <!-- Search -->
    <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4 mb-5">
      <div class="relative max-w-md">
        <svg lucideSearch class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" [size]="14" color="currentColor" />
        <input [(ngModel)]="searchQuery" placeholder="Search categories…"
          class="w-full pl-9 pr-4 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                 bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
                 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]" />
      </div>
    </div>

    <!-- Categories grid -->
    @if (filtered().length === 0) {
      <ui-empty-state title="No categories found" description="Create your first category to organise your products" actionLabel="Add Category" (action)="openModal()" />
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        @for (cat of filtered(); track cat.id) {
          <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]
                      hover:shadow-[var(--shadow-elevated)] transition-shadow group">
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
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ui-button variant="ghost" size="xs" (click)="editCategory(cat)">
                    <svg lucideEdit2 [size]="12" color="currentColor" />
                  </ui-button>
                  <ui-button variant="ghost" size="xs" (click)="deleteCategory(cat)">
                    <svg lucideTrash2 [size]="12" color="currentColor" class="text-red-500" />
                  </ui-button>
                </div>
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
  showModal = signal(false);
  editingCategory = signal<Category | null>(null);

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
    return !q ? this.categories() : this.categories().filter(c => c.name.toLowerCase().includes(q) || c.slug.includes(q));
  });

  activeCount = computed(() => this.categories().filter(c => c.status === 'active').length);
  totalProducts = computed(() => this.categories().reduce((s, c) => s + c.productCount, 0));

  ngOnInit() {
    this.layout.setPage('Categories', [{ label: 'Management' }, { label: 'Products', route: '/products' }, { label: 'Categories' }]);
  }

  openModal() { this.editingCategory.set(null); this.modalForm = { name: '', slug: '', description: '', color: '#4f46e5', status: 'active' }; this.showModal.set(true); }

  editCategory(cat: Category) {
    this.editingCategory.set(cat);
    this.modalForm = { name: cat.name, slug: cat.slug, description: cat.description, color: cat.color, status: cat.status };
    this.showModal.set(true);
  }

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
