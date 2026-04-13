import {
  ChangeDetectionStrategy, Component, OnInit, inject, signal, computed
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import {
  LucideAngularModule, ArrowLeft, Save, Eye, Package,
  Tag, BarChart2, Image, Upload, Trash2, Plus, Info
} from 'lucide-angular';
import { LayoutService } from '../../core/services/layout.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/form/input/input.component';
import { ToggleComponent } from '../../shared/components/form/toggle/toggle.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, RouterLink, CurrencyPipe,
    ButtonComponent, InputComponent, ToggleComponent, BadgeComponent, CardComponent,
    LucideAngularModule.pick({ ArrowLeft, Save, Eye, Package, Tag, BarChart2, Image, Upload, Trash2, Plus, Info }),
  ],
  template: `
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <ui-button variant="ghost" size="sm" [routerLink]="['/products']">
        <lucide-angular prefix name="arrow-left" [size]="14" color="currentColor" />
        Products
      </ui-button>
      <div class="flex-1">
        <h1 class="text-xl font-bold text-[var(--color-text-primary)]">
          {{ isEdit() ? 'Edit Product' : 'Add New Product' }}
        </h1>
        <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
          {{ isEdit() ? 'Update product details and inventory' : 'Fill in the details to create a new product' }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <ui-button variant="outline" size="sm" (click)="preview()">
          <lucide-angular prefix name="eye" [size]="14" color="currentColor" />
          Preview
        </ui-button>
        <ui-button variant="outline" size="sm" (click)="saveDraft()" [loading]="savingDraft()">Save Draft</ui-button>
        <ui-button variant="primary" (click)="publish()" [loading]="publishing()">
          <lucide-angular prefix name="save" [size]="14" color="currentColor" />
          {{ isEdit() ? 'Update' : 'Publish' }}
        </ui-button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Left: main content (2/3) -->
      <div class="lg:col-span-2 space-y-5">

        <!-- Basic Information -->
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6">
          <div class="flex items-center gap-2 mb-5">
            <lucide-angular name="package" [size]="16" color="currentColor" class="text-[var(--color-primary-600)]" />
            <h2 class="text-base font-semibold text-[var(--color-text-primary)]">Basic Information</h2>
          </div>
          <div class="space-y-4">
            <ui-input label="Product Name" placeholder="e.g. Wireless Noise-Cancel Headphones" [(value)]="form.name" [required]="true" />
            <div class="grid grid-cols-2 gap-4">
              <ui-input label="SKU" placeholder="e.g. ELC-001" [(value)]="form.sku" />
              <ui-input label="Barcode (UPC/EAN)" placeholder="e.g. 012345678901" [(value)]="form.barcode" />
            </div>
            <div>
              <label class="text-sm font-medium text-[var(--color-text-primary)] block mb-1.5">
                Description <span class="text-[var(--color-text-muted)] font-normal">(optional)</span>
              </label>
              <textarea
                [(ngModel)]="form.description"
                rows="4"
                placeholder="Describe your product in detail. Include key features, materials, dimensions, and anything a customer would want to know before purchasing."
                class="w-full px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                       bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]
                       resize-none">
              </textarea>
              <p class="text-xs text-[var(--color-text-muted)] mt-1">{{ form.description.length }}/2000 characters</p>
            </div>
          </div>
        </div>

        <!-- Media -->
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6">
          <div class="flex items-center gap-2 mb-5">
            <lucide-angular name="image" [size]="16" color="currentColor" class="text-[var(--color-primary-600)]" />
            <h2 class="text-base font-semibold text-[var(--color-text-primary)]">Product Media</h2>
          </div>
          <!-- Drop zone -->
          <div class="border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] p-8 text-center
                      hover:border-[var(--color-primary-400)] hover:bg-[var(--color-primary-50)] dark:hover:bg-[var(--color-primary-900)]/5
                      transition-colors cursor-pointer group">
            <lucide-angular name="upload" [size]="32" color="currentColor" class="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-500)] mx-auto mb-3 transition-colors" />
            <p class="text-sm font-medium text-[var(--color-text-primary)]">Drop files here or click to upload</p>
            <p class="text-xs text-[var(--color-text-muted)] mt-1">PNG, JPG, GIF or WebP · Max 5MB each · Up to 10 images</p>
            <ui-button variant="outline" size="sm" class="mt-4">
              <lucide-angular prefix name="upload" [size]="12" color="currentColor" />
              Choose Files
            </ui-button>
          </div>
          <!-- Placeholder thumbnails -->
          <div class="grid grid-cols-4 gap-3 mt-4">
            @for (i of [1,2,3]; track i) {
              <div class="relative aspect-square rounded-[var(--radius)] bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)]
                          border border-[var(--color-border)] flex items-center justify-center group/thumb cursor-pointer overflow-hidden">
                <lucide-angular name="image" [size]="24" color="currentColor" class="text-[var(--color-text-muted)]" />
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity
                            flex items-center justify-center gap-1">
                  <button class="p-1 rounded bg-white/20 hover:bg-white/40 text-white transition-colors">
                    <lucide-angular name="trash-2" [size]="12" color="currentColor" />
                  </button>
                </div>
              </div>
            }
            <div class="aspect-square rounded-[var(--radius)] border-2 border-dashed border-[var(--color-border)]
                        flex items-center justify-center cursor-pointer hover:border-[var(--color-primary-400)] transition-colors">
              <lucide-angular name="plus" [size]="20" color="currentColor" class="text-[var(--color-text-muted)]" />
            </div>
          </div>
        </div>

        <!-- Pricing -->
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6">
          <div class="flex items-center gap-2 mb-5">
            <lucide-angular name="tag" [size]="16" color="currentColor" class="text-[var(--color-primary-600)]" />
            <h2 class="text-base font-semibold text-[var(--color-text-primary)]">Pricing</h2>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="text-sm font-medium text-[var(--color-text-primary)] block mb-1.5">Price <span class="text-red-500">*</span></label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
                <input [(ngModel)]="form.price" type="number" min="0" step="0.01" placeholder="0.00"
                  class="w-full pl-7 pr-4 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                         bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]" />
              </div>
            </div>
            <div>
              <label class="text-sm font-medium text-[var(--color-text-primary)] block mb-1.5">Compare-at Price</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
                <input [(ngModel)]="form.comparePrice" type="number" min="0" step="0.01" placeholder="0.00"
                  class="w-full pl-7 pr-4 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                         bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]" />
              </div>
              <p class="text-xs text-[var(--color-text-muted)] mt-1">Shows a strikethrough "was" price</p>
            </div>
            <div>
              <label class="text-sm font-medium text-[var(--color-text-primary)] block mb-1.5">Cost per Item</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
                <input [(ngModel)]="form.cost" type="number" min="0" step="0.01" placeholder="0.00"
                  class="w-full pl-7 pr-4 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                         bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]" />
              </div>
              <p class="text-xs text-[var(--color-text-muted)] mt-1">Not shown to customers</p>
            </div>
          </div>
          @if (form.price && form.comparePrice && form.price < form.comparePrice) {
            <div class="mt-3 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-[var(--radius)] px-3 py-2">
              <lucide-angular name="info" [size]="12" color="currentColor" />
              Discount: {{ discountPercent() }}% off — customers will see the original price crossed out
            </div>
          }
        </div>

        <!-- Inventory -->
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6">
          <div class="flex items-center gap-2 mb-5">
            <lucide-angular name="bar-chart-2" [size]="16" color="currentColor" class="text-[var(--color-primary-600)]" />
            <h2 class="text-base font-semibold text-[var(--color-text-primary)]">Inventory & Shipping</h2>
          </div>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <ui-input label="Quantity" type="number" placeholder="0" [(value)]="form.stockStr" />
              <ui-input label="Low Stock Alert" type="number" placeholder="10" [(value)]="form.lowStockStr" />
            </div>
            <div class="flex items-center justify-between py-3 border-t border-[var(--color-border)]">
              <div>
                <div class="text-sm font-medium text-[var(--color-text-primary)]">Track inventory</div>
                <div class="text-xs text-[var(--color-text-muted)] mt-0.5">Automatically update stock count with each sale</div>
              </div>
              <ui-toggle [(value)]="form.trackInventory" />
            </div>
            <div class="flex items-center justify-between py-3 border-t border-[var(--color-border)]">
              <div>
                <div class="text-sm font-medium text-[var(--color-text-primary)]">Allow backorders</div>
                <div class="text-xs text-[var(--color-text-muted)] mt-0.5">Let customers buy even when stock is zero</div>
              </div>
              <ui-toggle [(value)]="form.allowBackorders" />
            </div>
            <div class="grid grid-cols-2 gap-4 pt-3 border-t border-[var(--color-border)]">
              <ui-input label="Weight (kg)" type="number" placeholder="0.00" [(value)]="form.weight" />
              <ui-input label="SKU / ISBN" placeholder="Auto-generated if empty" [(value)]="form.sku" />
            </div>
          </div>
        </div>

      </div>

      <!-- Right: metadata sidebar (1/3) -->
      <div class="space-y-5">

        <!-- Status -->
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-5">
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Product Status</h3>
          <div class="space-y-2">
            @for (opt of statusOptions; track opt.value) {
              <label class="flex items-start gap-3 p-3 rounded-[var(--radius)] cursor-pointer transition-colors"
                     [class.bg-[var(--color-primary-50)]]="form.status === opt.value"
                     [class.dark:bg-[var(--color-primary-900)]/10]="form.status === opt.value"
                     [class.border]="form.status === opt.value"
                     [class.border-[var(--color-primary-300)]]="form.status === opt.value"
                     [class.hover:bg-[var(--color-neutral-50)]]="form.status !== opt.value"
                     [class.dark:hover:bg-[var(--color-bg-elevated)]]="form.status !== opt.value">
                <input type="radio" name="status" [value]="opt.value" [(ngModel)]="form.status"
                       class="mt-0.5 accent-[var(--color-primary-600)]" />
                <div>
                  <div class="text-sm font-medium text-[var(--color-text-primary)]">{{ opt.label }}</div>
                  <div class="text-xs text-[var(--color-text-muted)]">{{ opt.description }}</div>
                </div>
              </label>
            }
          </div>
        </div>

        <!-- Organization -->
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-5">
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Organization</h3>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-[var(--color-text-primary)] block mb-1.5">Category</label>
              <select [(ngModel)]="form.category"
                class="w-full px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                       bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]">
                <option value="">Select category…</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Sports">Sports</option>
                <option value="Books">Books</option>
                <option value="Software">Software</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium text-[var(--color-text-primary)] block mb-1.5">Tags</label>
              <input [(ngModel)]="form.tagsInput" placeholder="e.g. wireless, premium, sale"
                class="w-full px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                       bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]" />
              <p class="text-xs text-[var(--color-text-muted)] mt-1">Separate tags with commas</p>
            </div>
            <div>
              <label class="text-sm font-medium text-[var(--color-text-primary)] block mb-1.5">Vendor / Brand</label>
              <input [(ngModel)]="form.vendor" placeholder="e.g. Sony, Nike, Custom"
                class="w-full px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                       bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]" />
            </div>
          </div>
        </div>

        <!-- SEO Preview -->
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-5">
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)] mb-1">SEO Preview</h3>
          <p class="text-xs text-[var(--color-text-muted)] mb-4">How this product may appear in search results</p>
          <div class="bg-white dark:bg-[var(--color-bg-elevated)] rounded-[var(--radius)] border border-[var(--color-border)] p-3">
            <div class="text-xs text-[var(--color-text-muted)] mb-1">yourstore.com › products</div>
            <div class="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
              {{ form.name || 'Product Name' }}
            </div>
            <div class="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">
              {{ form.description || 'Add a description to improve SEO and help customers find this product.' }}
            </div>
          </div>
          <div class="mt-3 space-y-3">
            <ui-input label="Meta Title" [(value)]="form.metaTitle" placeholder="Auto-generated from name" />
            <div>
              <label class="text-sm font-medium text-[var(--color-text-primary)] block mb-1.5">Meta Description</label>
              <textarea [(ngModel)]="form.metaDescription" rows="2" placeholder="Auto-generated from description"
                class="w-full px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                       bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] resize-none">
              </textarea>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class ProductFormComponent implements OnInit {
  private layout = inject(LayoutService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = signal(false);
  savingDraft = signal(false);
  publishing = signal(false);

  form = {
    name: '', sku: '', barcode: '', description: '',
    price: 0, comparePrice: 0, cost: 0,
    stockStr: '', lowStockStr: '10',
    trackInventory: true, allowBackorders: false,
    weight: '', status: 'draft', category: '',
    tagsInput: '', vendor: '', metaTitle: '', metaDescription: '',
  };

  statusOptions = [
    { value: 'active', label: 'Active', description: 'Visible and available for purchase' },
    { value: 'draft', label: 'Draft', description: 'Hidden from customers until published' },
    { value: 'archived', label: 'Archived', description: 'Not visible, kept for records' },
  ];

  discountPercent = computed(() => {
    if (this.form.comparePrice > 0 && this.form.price > 0) {
      return Math.round((1 - this.form.price / this.form.comparePrice) * 100);
    }
    return 0;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit.set(!!id && id !== 'new');
    this.layout.setPage(
      this.isEdit() ? 'Edit Product' : 'Add Product',
      [{ label: 'Management' }, { label: 'Products', route: '/products' }, { label: this.isEdit() ? 'Edit' : 'New' }]
    );
    if (this.isEdit()) {
      // Pre-fill with dummy data for demo
      this.form.name = 'Wireless Noise-Cancel Headphones';
      this.form.sku = 'ELC-001';
      this.form.description = 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and Hi-Res Audio certification.';
      this.form.price = 249.99;
      this.form.comparePrice = 349.99;
      this.form.cost = 89.99;
      this.form.stockStr = '47';
      this.form.category = 'Electronics';
      this.form.status = 'active';
      this.form.vendor = 'SoundPro';
      this.form.tagsInput = 'wireless, noise-cancel, premium, headphones';
    }
  }

  async saveDraft() {
    this.savingDraft.set(true);
    await new Promise(r => setTimeout(r, 700));
    this.savingDraft.set(false);
    this.toast.success('Draft saved', 'Your changes have been saved as a draft.');
  }

  async publish() {
    if (!this.form.name) { this.toast.error('Validation error', 'Product name is required.'); return; }
    if (!this.form.price) { this.toast.error('Validation error', 'Price is required.'); return; }
    this.publishing.set(true);
    await new Promise(r => setTimeout(r, 900));
    this.publishing.set(false);
    this.toast.success(
      this.isEdit() ? 'Product updated' : 'Product published',
      `${this.form.name} is now ${this.form.status === 'active' ? 'live' : 'saved'}.`
    );
    this.router.navigate(['/products']);
  }

  preview() { this.toast.info('Preview', 'Opening product preview in a new tab.'); }
}
