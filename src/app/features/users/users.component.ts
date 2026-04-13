import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { LayoutService } from '../../core/services/layout.service';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/form/input/input.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joined: string;
  lastLogin: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TitleCasePipe,
    AvatarComponent, BadgeComponent, ButtonComponent,
    InputComponent, SkeletonComponent, EmptyStateComponent,
    PaginationComponent, ModalComponent,
  ],
  template: `
    <!-- Page header -->
    <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold text-[var(--color-text-primary)]">Users</h1>
        <p class="text-sm text-[var(--color-text-secondary)] mt-0.5">
          Manage your team and user permissions
        </p>
      </div>
      <ui-button variant="primary" (click)="openAddModal()">
        <svg slot="prefix-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add User
      </ui-button>
    </div>

    <!-- Filters bar -->
    <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)]
                shadow-[var(--shadow-card)] p-4 mb-5">
      <div class="flex flex-wrap items-center gap-3">

        <!-- Search -->
        <div class="relative flex-1 min-w-52">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
               width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            [(ngModel)]="searchQuery"
            placeholder="Search users..."
            class="w-full pl-9 pr-4 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                   bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
                   focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]" />
        </div>

        <!-- Role filter -->
        <select
          [(ngModel)]="roleFilter"
          class="px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                 bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]
                 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>

        <!-- Status filter -->
        <select
          [(ngModel)]="statusFilter"
          class="px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                 bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]
                 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>

        @if (searchQuery || roleFilter || statusFilter) {
          <ui-button variant="ghost" size="sm" (click)="clearFilters()">Clear filters</ui-button>
        }

        <div class="ml-auto text-sm text-[var(--color-text-muted)]">
          {{ filteredUsers().length }} users
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)]
                shadow-[var(--shadow-card)] overflow-hidden">

      @if (loading()) {
        <div class="p-4 space-y-1">
          @for (i of [1,2,3,4,5]; track i) {
            <ui-skeleton type="row" />
          }
        </div>
      } @else if (pagedUsers().length === 0) {
        <ui-empty-state
          title="No users found"
          description="Try adjusting your search or filters"
          actionLabel="Clear filters"
          (action)="clearFilters()" />
      } @else {
        <!-- Table header -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-[var(--color-neutral-50)] dark:bg-[var(--color-bg-elevated)]">
              <tr>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">User</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Role</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Status</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Joined</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Last Login</th>
                <th class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-border)]">
              @for (user of pagedUsers(); track user.id) {
                <tr class="hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <ui-avatar [name]="user.name" size="sm" />
                      <div>
                        <div class="text-sm font-medium text-[var(--color-text-primary)]">{{ user.name }}</div>
                        <div class="text-xs text-[var(--color-text-muted)]">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm text-[var(--color-text-secondary)] capitalize">{{ user.role }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <ui-badge [variant]="statusVariant(user.status)" size="sm" [dot]="true">
                      {{ user.status | titlecase }}
                    </ui-badge>
                  </td>
                  <td class="px-6 py-4 text-sm text-[var(--color-text-muted)]">{{ user.joined }}</td>
                  <td class="px-6 py-4 text-sm text-[var(--color-text-muted)]">{{ user.lastLogin }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ui-button variant="ghost" size="xs" (click)="editUser(user)">Edit</ui-button>
                      <ui-button variant="ghost" size="xs" (click)="deleteUser(user)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-500">
                          <polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6m5 0V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </ui-button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-[var(--color-border)]">
          <ui-pagination
            [page]="currentPage()"
            [pageSize]="pageSize"
            [total]="filteredUsers().length"
            (pageChange)="currentPage.set($event)" />
        </div>
      }
    </div>

    <!-- Add User Modal -->
    @if (showModal()) {
      <ui-modal title="Add New User" subtitle="Fill in the details below" size="md" (close)="showModal.set(false)">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <ui-input label="First Name" placeholder="John" [(value)]="newUser.firstName" />
            <ui-input label="Last Name" placeholder="Doe" [(value)]="newUser.lastName" />
          </div>
          <ui-input label="Email" type="email" placeholder="john@example.com" [(value)]="newUser.email" />
          <div>
            <label class="text-sm font-medium text-[var(--color-text-primary)] block mb-1.5">Role</label>
            <select [(ngModel)]="newUser.role"
                    class="w-full px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                           bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20">
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div modal-footer>
          <ui-button variant="outline" (click)="showModal.set(false)">Cancel</ui-button>
          <ui-button variant="primary" (click)="addUser()">Add User</ui-button>
        </div>
      </ui-modal>
    }
  `
})
export class UsersComponent implements OnInit {
  private layout = inject(LayoutService);
  private toast = inject(ToastService);

  loading = signal(true);
  showModal = signal(false);
  currentPage = signal(1);
  pageSize = 8;

  searchQuery = '';
  roleFilter = '';
  statusFilter = '';

  newUser = { firstName: '', lastName: '', email: '', role: 'viewer' };

  allUsers = signal<User[]>([
    { id: 1, name: 'Alex Johnson', email: 'alex@adminkit.io', role: 'admin', status: 'active', joined: 'Jan 15, 2024', lastLogin: '2 min ago' },
    { id: 2, name: 'Sarah Williams', email: 'sarah@example.com', role: 'editor', status: 'active', joined: 'Feb 8, 2024', lastLogin: '1 hour ago' },
    { id: 3, name: 'Michael Chen', email: 'mike@example.com', role: 'viewer', status: 'active', joined: 'Mar 22, 2024', lastLogin: 'Yesterday' },
    { id: 4, name: 'Emma Wilson', email: 'emma@example.com', role: 'editor', status: 'pending', joined: 'Apr 5, 2024', lastLogin: 'Never' },
    { id: 5, name: 'James Brown', email: 'james@example.com', role: 'viewer', status: 'inactive', joined: 'May 14, 2024', lastLogin: '3 weeks ago' },
    { id: 6, name: 'Lisa Martinez', email: 'lisa@example.com', role: 'admin', status: 'active', joined: 'Jun 1, 2024', lastLogin: '5 min ago' },
    { id: 7, name: 'David Kim', email: 'david@example.com', role: 'viewer', status: 'active', joined: 'Jul 19, 2024', lastLogin: 'Today' },
    { id: 8, name: 'Anna Taylor', email: 'anna@example.com', role: 'editor', status: 'active', joined: 'Aug 3, 2024', lastLogin: '2 days ago' },
    { id: 9, name: 'Chris Davis', email: 'chris@example.com', role: 'viewer', status: 'pending', joined: 'Sep 27, 2024', lastLogin: 'Never' },
    { id: 10, name: 'Sophie Lee', email: 'sophie@example.com', role: 'editor', status: 'active', joined: 'Oct 12, 2024', lastLogin: 'Yesterday' },
    { id: 11, name: 'Ryan Garcia', email: 'ryan@example.com', role: 'viewer', status: 'inactive', joined: 'Nov 5, 2024', lastLogin: '1 month ago' },
    { id: 12, name: 'Mia Thompson', email: 'mia@example.com', role: 'admin', status: 'active', joined: 'Dec 1, 2024', lastLogin: '30 min ago' },
  ]);

  filteredUsers = computed(() => {
    const q = this.searchQuery.toLowerCase();
    return this.allUsers().filter(u =>
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (!this.roleFilter || u.role === this.roleFilter) &&
      (!this.statusFilter || u.status === this.statusFilter)
    );
  });

  pagedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  ngOnInit() {
    this.layout.setPage('Users', [{ label: 'Management' }, { label: 'Users' }]);
    setTimeout(() => this.loading.set(false), 500);
  }

  statusVariant(status: string): any {
    return { active: 'success', inactive: 'neutral', pending: 'warning' }[status] || 'neutral';
  }

  clearFilters() { this.searchQuery = ''; this.roleFilter = ''; this.statusFilter = ''; this.currentPage.set(1); }
  openAddModal() { this.newUser = { firstName: '', lastName: '', email: '', role: 'viewer' }; this.showModal.set(true); }

  addUser() {
    if (!this.newUser.firstName || !this.newUser.email) { this.toast.error('Validation error', 'Name and email are required.'); return; }
    const newEntry: User = {
      id: Date.now(), name: `${this.newUser.firstName} ${this.newUser.lastName}`.trim(),
      email: this.newUser.email, role: this.newUser.role, status: 'pending',
      joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastLogin: 'Never',
    };
    this.allUsers.update(u => [newEntry, ...u]);
    this.showModal.set(false);
    this.toast.success('User added', `${newEntry.name} has been added as ${newEntry.role}.`);
  }

  editUser(user: User) { this.toast.info('Edit user', `Editing ${user.name}`); }

  deleteUser(user: User) {
    this.allUsers.update(u => u.filter(x => x.id !== user.id));
    this.toast.success('User removed', `${user.name} has been deleted.`);
  }
}
