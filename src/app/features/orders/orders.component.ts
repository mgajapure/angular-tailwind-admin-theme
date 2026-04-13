import {
  ChangeDetectionStrategy, Component, OnInit, computed, inject, signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import {
  LucideSearch, LucideDownload, LucideEye, LucidePackage, LucideTruck,
  LucideMapPin, LucideCreditCard,
  LucideShoppingCart, LucideClock, LucideDollarSign, LucideCheckCircle,
  LucideDynamicIcon, provideLucideIcons,
} from '@lucide/angular';
import { LayoutService } from '../../core/services/layout.service';
import { ToastService } from '../../core/services/toast.service';
import { BadgeComponent, BadgeVariant } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { DrawerComponent } from '../../shared/components/drawer/drawer.component';
import { ProgressComponent } from '../../shared/components/progress/progress.component';

interface OrderItem {
  name: string;
  sku: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  fulfillmentStatus: 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  paymentMethod: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideLucideIcons(LucideShoppingCart, LucideClock, LucideTruck, LucideDollarSign, LucideCheckCircle),
  ],
  imports: [
    FormsModule, CurrencyPipe, TitleCasePipe,
    BadgeComponent, ButtonComponent, AvatarComponent,
    SkeletonComponent, EmptyStateComponent, PaginationComponent, DrawerComponent, ProgressComponent,
    LucideSearch, LucideDownload, LucideEye, LucidePackage, LucideTruck,
    LucideMapPin, LucideCreditCard, LucideDynamicIcon,
  ],
  template: `
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold text-[var(--color-text-primary)]">Orders</h1>
        <p class="text-sm text-[var(--color-text-secondary)] mt-0.5">Track and manage customer orders</p>
      </div>
      <ui-button variant="outline" size="sm" (click)="exportOrders()">
        <svg lucideDownload prefix [size]="14" color="currentColor" />
        Export
      </ui-button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      @for (stat of stats; track stat.label) {
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="text-xs text-[var(--color-text-muted)] font-medium">{{ stat.label }}</div>
            <div class="w-8 h-8 rounded-[var(--radius)] flex items-center justify-center" [class]="stat.iconBg">
              <svg [lucideIcon]="stat.icon" [size]="14" color="currentColor" [class]="stat.iconColor" />
            </div>
          </div>
          <div class="text-2xl font-bold text-[var(--color-text-primary)]">{{ stat.value }}</div>
          @if (stat.sub) {
            <div class="text-xs text-[var(--color-text-muted)] mt-0.5">{{ stat.sub }}</div>
          }
        </div>
      }
    </div>

    <!-- Filters -->
    <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4 mb-5">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-52">
          <svg lucideSearch class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" [size]="14" color="currentColor" />
          <input [(ngModel)]="searchQuery" placeholder="Search orders or customers…"
            class="w-full pl-9 pr-4 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                   bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
                   focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]" />
        </div>
        <select [(ngModel)]="paymentFilter"
          class="px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                 bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]
                 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20">
          <option value="">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select [(ngModel)]="fulfillmentFilter"
          class="px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                 bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]
                 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20">
          <option value="">All Fulfillment</option>
          <option value="unfulfilled">Unfulfilled</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        @if (searchQuery || paymentFilter || fulfillmentFilter) {
          <ui-button variant="ghost" size="sm" (click)="clearFilters()">Clear</ui-button>
        }
        <div class="ml-auto text-sm text-[var(--color-text-muted)]">{{ filteredOrders().length }} orders</div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden">
      @if (loading()) {
        <div class="p-4 space-y-1">
          @for (i of [1,2,3,4,5]; track i) { <ui-skeleton type="row" /> }
        </div>
      } @else if (pagedOrders().length === 0) {
        <ui-empty-state title="No orders found" description="Adjust your filters to see more results" actionLabel="Clear filters" (action)="clearFilters()" />
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-[var(--color-neutral-50)] dark:bg-[var(--color-bg-elevated)]">
              <tr>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Order</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Customer</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Date</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Items</th>
                <th class="text-right text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Total</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Payment</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Fulfillment</th>
                <th class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-border)]">
              @for (order of pagedOrders(); track order.id) {
                <tr class="hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors group cursor-pointer"
                    (click)="openDetail(order)">
                  <td class="px-6 py-4">
                    <span class="text-sm font-semibold text-[var(--color-primary-600)]">{{ order.id }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2.5">
                      <ui-avatar [name]="order.customer" size="sm" />
                      <div>
                        <div class="text-sm font-medium text-[var(--color-text-primary)]">{{ order.customer }}</div>
                        <div class="text-xs text-[var(--color-text-muted)]">{{ order.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-[var(--color-text-muted)]">{{ order.date }}</td>
                  <td class="px-6 py-4 text-sm text-[var(--color-text-secondary)]">{{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }}</td>
                  <td class="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text-primary)]">{{ order.total | currency }}</td>
                  <td class="px-6 py-4">
                    <ui-badge [variant]="paymentVariant(order.paymentStatus)" size="sm" [dot]="true">
                      {{ order.paymentStatus | titlecase }}
                    </ui-badge>
                  </td>
                  <td class="px-6 py-4">
                    <ui-badge [variant]="fulfillmentVariant(order.fulfillmentStatus)" size="sm">
                      {{ fulfillmentLabel(order.fulfillmentStatus) }}
                    </ui-badge>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ui-button variant="ghost" size="xs" (click)="openDetail(order); $event.stopPropagation()">
                        <svg lucideEye [size]="12" color="currentColor" />
                      </ui-button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="px-6 py-4 border-t border-[var(--color-border)]">
          <ui-pagination [page]="currentPage()" [pageSize]="pageSize" [total]="filteredOrders().length" (pageChange)="currentPage.set($event)" />
        </div>
      }
    </div>

    <!-- Order Detail Drawer -->
    <ui-drawer [open]="!!selectedOrder()" title="Order Details" size="lg" (close)="selectedOrder.set(null)">
      @if (selectedOrder(); as order) {
        <!-- Order header -->
        <div class="flex items-start justify-between mb-6">
          <div>
            <div class="text-lg font-bold text-[var(--color-text-primary)]">{{ order.id }}</div>
            <div class="text-sm text-[var(--color-text-muted)]">{{ order.date }}</div>
          </div>
          <div class="flex items-center gap-2">
            <ui-badge [variant]="paymentVariant(order.paymentStatus)" [dot]="true">{{ order.paymentStatus | titlecase }}</ui-badge>
            <ui-badge [variant]="fulfillmentVariant(order.fulfillmentStatus)">{{ fulfillmentLabel(order.fulfillmentStatus) }}</ui-badge>
          </div>
        </div>

        <!-- Fulfillment timeline -->
        <div class="mb-6">
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Order Timeline</h3>
          <div class="flex items-center gap-0">
            @for (step of fulfillmentSteps; track step.key; let last = $last) {
              <div class="flex-1 flex flex-col items-center">
                <div class="w-7 h-7 rounded-full flex items-center justify-center z-10 transition-all"
                     [class]="isStepDone(order.fulfillmentStatus, step.key) ? 'bg-[var(--color-primary-600)] text-white' : 'bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'">
                  <svg [lucideIcon]="step.icon" [size]="14" color="currentColor" />
                </div>
                <div class="text-[10px] text-[var(--color-text-muted)] mt-1 text-center">{{ step.label }}</div>
              </div>
              @if (!last) {
                <div class="flex-1 h-0.5 mb-5 -mx-1" [class]="isStepDone(order.fulfillmentStatus, step.key) ? 'bg-[var(--color-primary-600)]' : 'bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)]'"></div>
              }
            }
          </div>
        </div>

        <!-- Customer -->
        <div class="mb-6 p-4 bg-[var(--color-neutral-50)] dark:bg-[var(--color-bg-elevated)] rounded-[var(--radius-lg)]">
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Customer</h3>
          <div class="flex items-center gap-3 mb-3">
            <ui-avatar [name]="order.customer" size="md" />
            <div>
              <div class="text-sm font-medium text-[var(--color-text-primary)]">{{ order.customer }}</div>
              <div class="text-xs text-[var(--color-text-muted)]">{{ order.email }}</div>
            </div>
          </div>
          <div class="flex items-start gap-2 text-xs text-[var(--color-text-muted)]">
            <svg lucideMapPin [size]="12" color="currentColor" class="mt-0.5 shrink-0" />
            <span>{{ order.shippingAddress }}</span>
          </div>
        </div>

        <!-- Items -->
        <div class="mb-6">
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Order Items</h3>
          <div class="space-y-3">
            @for (item of order.items; track item.sku) {
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-[var(--radius)] bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)] flex items-center justify-center shrink-0">
                  <svg lucidePackage [size]="16" color="currentColor" class="text-[var(--color-text-muted)]" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-[var(--color-text-primary)] truncate">{{ item.name }}</div>
                  <div class="text-xs text-[var(--color-text-muted)]">{{ item.sku }} · Qty: {{ item.qty }}</div>
                </div>
                <div class="text-sm font-semibold text-[var(--color-text-primary)] shrink-0">{{ item.price * item.qty | currency }}</div>
              </div>
            }
          </div>
        </div>

        <!-- Summary -->
        <div class="p-4 bg-[var(--color-neutral-50)] dark:bg-[var(--color-bg-elevated)] rounded-[var(--radius-lg)] mb-6">
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
              <span>Subtotal</span><span>{{ order.subtotal | currency }}</span>
            </div>
            <div class="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
              <span>Shipping</span><span>{{ order.shipping | currency }}</span>
            </div>
            <div class="flex items-center justify-between text-sm font-bold text-[var(--color-text-primary)] border-t border-[var(--color-border)] pt-2 mt-2">
              <span>Total</span><span>{{ order.total | currency }}</span>
            </div>
          </div>
        </div>

        <!-- Payment -->
        <div class="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <svg lucideCreditCard [size]="12" color="currentColor" />
          <span>Paid via {{ order.paymentMethod }}</span>
        </div>
      }

      <div drawer-footer>
        <ui-button variant="outline" (click)="selectedOrder.set(null)">Close</ui-button>
        <ui-button variant="primary" (click)="markShipped()">
          <svg lucideTruck prefix [size]="14" color="currentColor" />
          Mark as Shipped
        </ui-button>
      </div>
    </ui-drawer>
  `
})
export class OrdersComponent implements OnInit {
  private layout = inject(LayoutService);
  private toast = inject(ToastService);

  loading = signal(true);
  currentPage = signal(1);
  pageSize = 10;
  searchQuery = '';
  paymentFilter = '';
  fulfillmentFilter = '';
  selectedOrder = signal<Order | null>(null);

  fulfillmentSteps = [
    { key: 'processing', label: 'Processing', icon: 'clock' },
    { key: 'shipped', label: 'Shipped', icon: 'truck' },
    { key: 'delivered', label: 'Delivered', icon: 'check-circle' },
  ];

  stats = [
    { label: 'Total Orders', value: '1,284', icon: 'shopping-cart', iconBg: 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20', iconColor: 'text-[var(--color-primary-600)]', sub: '+8.2% this month' },
    { label: 'Pending', value: '24', icon: 'clock', iconBg: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600', sub: 'Needs attention' },
    { label: 'Shipped', value: '156', icon: 'truck', iconBg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600', sub: 'In transit' },
    { label: 'Revenue', value: '$48,920', icon: 'dollar-sign', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600', sub: 'This month' },
  ];

  allOrders = signal<Order[]>([
    { id: '#ORD-10241', customer: 'Sarah Johnson', email: 'sarah@example.com', date: 'Dec 13, 2024', items: [{ name: 'Pro Analytics Suite', sku: 'SFT-001', qty: 1, price: 299 }, { name: 'Portable SSD 1TB', sku: 'ELC-004', qty: 2, price: 119.99 }], subtotal: 538.98, shipping: 0, total: 538.98, paymentStatus: 'paid', fulfillmentStatus: 'delivered', shippingAddress: '123 Main St, San Francisco, CA 94105', paymentMethod: 'Visa ending 4242' },
    { id: '#ORD-10240', customer: 'Michael Chen', email: 'mike@example.com', date: 'Dec 13, 2024', items: [{ name: 'Enterprise Dashboard', sku: 'SFT-002', qty: 1, price: 599 }], subtotal: 599, shipping: 0, total: 599, paymentStatus: 'paid', fulfillmentStatus: 'shipped', shippingAddress: '456 Oak Ave, New York, NY 10001', paymentMethod: 'Mastercard ending 8765' },
    { id: '#ORD-10239', customer: 'Emma Wilson', email: 'emma@example.com', date: 'Dec 12, 2024', items: [{ name: 'Wireless Headphones', sku: 'ELC-001', qty: 1, price: 249.99 }, { name: 'Monitor Light Bar', sku: 'ELC-005', qty: 1, price: 59.99 }], subtotal: 309.98, shipping: 12.99, total: 322.97, paymentStatus: 'paid', fulfillmentStatus: 'processing', shippingAddress: '789 Pine Rd, Austin, TX 78701', paymentMethod: 'PayPal' },
    { id: '#ORD-10238', customer: 'James Brown', email: 'james@example.com', date: 'Dec 12, 2024', items: [{ name: 'Ergonomic Desk', sku: 'HMG-001', qty: 1, price: 649 }], subtotal: 649, shipping: 49, total: 698, paymentStatus: 'failed', fulfillmentStatus: 'cancelled', shippingAddress: '321 Elm St, Chicago, IL 60601', paymentMethod: 'Visa ending 1111' },
    { id: '#ORD-10237', customer: 'Lisa Martinez', email: 'lisa@example.com', date: 'Dec 11, 2024', items: [{ name: 'Smart Home Hub', sku: 'ELC-003', qty: 2, price: 149.99 }], subtotal: 299.98, shipping: 0, total: 299.98, paymentStatus: 'paid', fulfillmentStatus: 'delivered', shippingAddress: '654 Maple Ave, Seattle, WA 98101', paymentMethod: 'Apple Pay' },
    { id: '#ORD-10236', customer: 'David Kim', email: 'david@example.com', date: 'Dec 11, 2024', items: [{ name: 'Mechanical Keyboard', sku: 'ELC-002', qty: 1, price: 179.99 }], subtotal: 179.99, shipping: 9.99, total: 189.98, paymentStatus: 'pending', fulfillmentStatus: 'unfulfilled', shippingAddress: '987 Cedar Blvd, Portland, OR 97201', paymentMethod: 'Bank Transfer' },
    { id: '#ORD-10235', customer: 'Anna Taylor', email: 'anna@example.com', date: 'Dec 10, 2024', items: [{ name: 'Running Shoes', sku: 'SPT-001', qty: 1, price: 129.99 }, { name: 'Yoga Mat', sku: 'SPT-002', qty: 1, price: 79.99 }], subtotal: 209.98, shipping: 0, total: 209.98, paymentStatus: 'paid', fulfillmentStatus: 'shipped', shippingAddress: '147 Birch St, Denver, CO 80201', paymentMethod: 'Visa ending 5555' },
    { id: '#ORD-10234', customer: 'Chris Davis', email: 'chris@example.com', date: 'Dec 10, 2024', items: [{ name: 'Bamboo Organizer', sku: 'HMG-002', qty: 3, price: 44.99 }], subtotal: 134.97, shipping: 7.99, total: 142.96, paymentStatus: 'refunded', fulfillmentStatus: 'cancelled', shippingAddress: '258 Walnut Dr, Boston, MA 02101', paymentMethod: 'Mastercard ending 3333' },
    { id: '#ORD-10233', customer: 'Sophie Lee', email: 'sophie@example.com', date: 'Dec 9, 2024', items: [{ name: 'JavaScript Book', sku: 'BKS-001', qty: 2, price: 34.99 }], subtotal: 69.98, shipping: 4.99, total: 74.97, paymentStatus: 'paid', fulfillmentStatus: 'delivered', shippingAddress: '369 Spruce Ave, Miami, FL 33101', paymentMethod: 'PayPal' },
    { id: '#ORD-10232', customer: 'Ryan Garcia', email: 'ryan@example.com', date: 'Dec 9, 2024', items: [{ name: 'Pro Analytics Suite', sku: 'SFT-001', qty: 1, price: 299 }, { name: 'Smart Home Hub', sku: 'ELC-003', qty: 1, price: 149.99 }], subtotal: 448.99, shipping: 0, total: 448.99, paymentStatus: 'paid', fulfillmentStatus: 'processing', shippingAddress: '741 Ash St, Phoenix, AZ 85001', paymentMethod: 'Visa ending 9876' },
    { id: '#ORD-10231', customer: 'Mia Thompson', email: 'mia@example.com', date: 'Dec 8, 2024', items: [{ name: 'Portable SSD', sku: 'ELC-004', qty: 1, price: 119.99 }], subtotal: 119.99, shipping: 0, total: 119.99, paymentStatus: 'paid', fulfillmentStatus: 'shipped', shippingAddress: '852 Oak Ln, Nashville, TN 37201', paymentMethod: 'Apple Pay' },
    { id: '#ORD-10230', customer: 'Alex Johnson', email: 'alex@example.com', date: 'Dec 8, 2024', items: [{ name: 'Enterprise Dashboard', sku: 'SFT-002', qty: 1, price: 599 }, { name: 'Pro Analytics Suite', sku: 'SFT-001', qty: 1, price: 299 }], subtotal: 898, shipping: 0, total: 898, paymentStatus: 'paid', fulfillmentStatus: 'delivered', shippingAddress: '963 Pine Ct, Los Angeles, CA 90001', paymentMethod: 'Stripe' },
  ]);

  filteredOrders = computed(() => {
    const q = this.searchQuery.toLowerCase();
    return this.allOrders().filter(o =>
      (!q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.email.toLowerCase().includes(q)) &&
      (!this.paymentFilter || o.paymentStatus === this.paymentFilter) &&
      (!this.fulfillmentFilter || o.fulfillmentStatus === this.fulfillmentFilter)
    );
  });

  pagedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredOrders().slice(start, start + this.pageSize);
  });

  ngOnInit() {
    this.layout.setPage('Orders', [{ label: 'Management' }, { label: 'Orders' }]);
    setTimeout(() => this.loading.set(false), 400);
  }

  paymentVariant(status: string): BadgeVariant {
    return ({ paid: 'success', pending: 'warning', failed: 'danger', refunded: 'info' } as Record<string, BadgeVariant>)[status] ?? 'neutral';
  }

  fulfillmentVariant(status: string): BadgeVariant {
    return ({ unfulfilled: 'warning', processing: 'info', shipped: 'primary', delivered: 'success', cancelled: 'neutral' } as Record<string, BadgeVariant>)[status] ?? 'neutral';
  }

  fulfillmentLabel(status: string): string {
    return ({ unfulfilled: 'Unfulfilled', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' })[status] ?? status;
  }

  isStepDone(current: string, step: string): boolean {
    const order = ['processing', 'shipped', 'delivered'];
    return order.indexOf(current) >= order.indexOf(step);
  }

  openDetail(order: Order) { this.selectedOrder.set(order); }
  clearFilters() { this.searchQuery = ''; this.paymentFilter = ''; this.fulfillmentFilter = ''; this.currentPage.set(1); }
  exportOrders() { this.toast.info('Export started', 'Your orders are being exported to CSV.'); }

  markShipped() {
    const order = this.selectedOrder();
    if (!order) return;
    this.allOrders.update(orders => orders.map(o => o.id === order.id ? { ...o, fulfillmentStatus: 'shipped' } : o));
    this.selectedOrder.set({ ...order, fulfillmentStatus: 'shipped' });
    this.toast.success('Order shipped', `${order.id} has been marked as shipped.`);
  }
}
