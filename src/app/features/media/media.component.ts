import {
  ChangeDetectionStrategy, Component, OnInit, computed, inject, signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import {
  LucideUpload, LucideSearch, LucideGrid2x2, LucideList, LucideTrash2,
  LucideDownload, LucideCopy, LucideEye, LucideHardDrive, LucideCheck,
  LucideImage, LucideFilm, LucideFileText, LucideMusic, LucideArchive,
  LucideMoreVertical, LucideDynamicIcon, provideLucideIcons,
} from '@lucide/angular';
import { LayoutService } from '../../core/services/layout.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../shared/components/dropdown/dropdown-item.component';
import { DropdownSeparatorComponent } from '../../shared/components/dropdown/dropdown-separator.component';

type MediaType = 'all' | 'image' | 'video' | 'document' | 'audio' | 'archive';
type ViewMode = 'grid' | 'list';

interface MediaFile {
  id: number;
  name: string;
  type: MediaType;
  ext: string;
  size: number;
  dimensions?: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}

@Component({
  selector: 'app-media',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideLucideIcons(LucideImage, LucideFilm, LucideFileText, LucideMusic, LucideArchive),
  ],
  imports: [
    FormsModule, DecimalPipe,
    ButtonComponent, BadgeComponent, EmptyStateComponent, ModalComponent, PaginationComponent,
    DropdownComponent, DropdownItemComponent, DropdownSeparatorComponent,
    LucideUpload, LucideSearch, LucideGrid2x2, LucideList, LucideTrash2,
    LucideDownload, LucideCopy, LucideEye, LucideHardDrive, LucideCheck,
    LucideMoreVertical, LucideDynamicIcon,
  ],
  template: `
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold text-[var(--color-text-primary)]">Media Library</h1>
        <p class="text-sm text-[var(--color-text-secondary)] mt-0.5">Manage images, videos, documents, and other files</p>
      </div>
      <ui-button variant="primary" (click)="triggerUpload()">
        <svg lucideUpload prefix [size]="14" color="currentColor" />
        Upload Files
      </ui-button>
    </div>

    <!-- Storage usage -->
    <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-5 mb-5">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <svg lucideHardDrive [size]="16" color="currentColor" class="text-[var(--color-primary-600)]" />
          <span class="text-sm font-semibold text-[var(--color-text-primary)]">Storage Usage</span>
        </div>
        <span class="text-sm text-[var(--color-text-muted)]">4.2 GB of 20 GB used (21%)</span>
      </div>
      <div class="w-full bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)] rounded-full h-2 overflow-hidden">
        <div class="h-2 rounded-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)]" style="width: 21%"></div>
      </div>
      <div class="grid grid-cols-4 gap-4 mt-4">
        @for (type of storageBreakdown; track type.label) {
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full shrink-0" [style.background]="type.color"></div>
            <div>
              <div class="text-xs font-medium text-[var(--color-text-primary)]">{{ type.label }}</div>
              <div class="text-xs text-[var(--color-text-muted)]">{{ type.size }}</div>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Filter Card -->
    <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4 mb-5">

      <!-- Type filter tabs (pill style) -->
      <div class="flex items-center gap-1 bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)] rounded-[var(--radius)] p-1 mb-3">
        @for (tab of typeTabs; track tab.value) {
          <button (click)="typeFilter.set(tab.value)"
            class="px-3 py-1 text-xs font-medium rounded-[var(--radius-sm)] transition-colors"
            [class.bg-white]="typeFilter() === tab.value"
            [class.dark:bg-[var(--color-bg-surface)]]="typeFilter() === tab.value"
            [class.shadow-[var(--shadow-card)]]="typeFilter() === tab.value"
            [class.text-[var(--color-text-primary)]]="typeFilter() === tab.value"
            [class.text-[var(--color-text-muted)]]="typeFilter() !== tab.value"
            [class.hover:text-[var(--color-text-primary)]]="typeFilter() !== tab.value">
            {{ tab.label }}
            <span class="ml-1 text-[10px] text-[var(--color-text-muted)]">{{ typeCount(tab.value) }}</span>
          </button>
        }
      </div>

      <!-- Search, Sort & View Toggle -->
      <div class="flex flex-wrap items-center gap-3">

        <!-- Search -->
        <div class="relative flex-1 min-w-48">
          <svg lucideSearch class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" [size]="13" color="currentColor" />
          <input [(ngModel)]="searchQuery" placeholder="Search files…"
            class="w-full pl-8 pr-4 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                   bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
                   focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]" />
        </div>

        <!-- Sort -->
        <select [(ngModel)]="sortBy"
          class="px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                 bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]
                 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20">
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="name">Name A–Z</option>
          <option value="size_desc">Largest first</option>
        </select>

        <div class="ml-auto flex items-center gap-3">
          <!-- File count -->
          <span class="text-sm text-[var(--color-text-muted)]">{{ filteredFiles().length }} files</span>

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
            <button (click)="viewMode.set('list')"
              class="p-1.5 rounded-[var(--radius-sm)] transition-colors"
              [class.bg-[var(--color-primary-100)]]="viewMode() === 'list'"
              [class.dark:bg-[var(--color-primary-900)]/20]="viewMode() === 'list'"
              [class.text-[var(--color-primary-600)]]="viewMode() === 'list'"
              [class.text-[var(--color-text-muted)]]="viewMode() !== 'list'"
              title="List view">
              <svg lucideList [size]="14" color="currentColor" />
            </button>
          </div>
        </div>

        @if (selectedIds().size > 0) {
          <div class="flex items-center gap-2 ml-2">
            <span class="text-xs font-medium text-[var(--color-primary-600)]">{{ selectedIds().size }} selected</span>
            <ui-button variant="outline" size="xs" (click)="bulkDownload()">
              <svg lucideDownload prefix [size]="10" color="currentColor" />
              Download
            </ui-button>
            <ui-button variant="ghost" size="xs" (click)="bulkDelete()">
              <svg lucideTrash2 prefix [size]="10" color="currentColor" class="text-red-500" />
              Delete
            </ui-button>
            <ui-button variant="ghost" size="xs" (click)="resetSelectedIds()">
              <svg [size]="10" class="text-[var(--color-text-muted)]" lucideCheck color="currentColor" />
            </ui-button>
          </div>
        }
      </div>
    </div>

    @if (filteredFiles().length === 0) {
      <ui-empty-state title="No files found" description="Upload files or adjust your search" actionLabel="Upload Files" (action)="triggerUpload()" />
    } @else {

      <!-- ── Grid View ──────────────────────────────────────────────── -->
      @if (viewMode() === 'grid') {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          @for (file of pagedFiles(); track file.id) {
            <div class="relative bg-[var(--color-bg-surface)] border rounded-[var(--radius-lg)] overflow-hidden transition-all cursor-pointer"
                 [class.border-[var(--color-primary-400)]]="selectedIds().has(file.id)"
                 [class.shadow-[0_0_0_2px_var(--color-primary-200)]]="selectedIds().has(file.id)"
                 [class.border-[var(--color-border)]]="!selectedIds().has(file.id)"
                 [class.hover:border-[var(--color-primary-300)]]="!selectedIds().has(file.id)"
                 (click)="toggleFileSelect(file.id)">

              <!-- Preview area -->
              <div class="aspect-square flex items-center justify-center" [class]="filePreviewBg(file.type)">
                <svg [lucideIcon]="fileIcon(file.type)" [size]="32" color="currentColor" [class]="fileIconColor(file.type)" />
              </div>

              <!-- Selection indicator -->
              @if (selectedIds().has(file.id)) {
                <div class="absolute top-2 left-2 w-5 h-5 rounded-full bg-[var(--color-primary-600)] flex items-center justify-center z-10"
                     (click)="$event.stopPropagation()">
                  <svg lucideCheck [size]="10" color="currentColor" class="text-white" />
                </div>
              }

              <!-- Always-visible action dropdown (top-right) -->
              <div class="absolute top-1.5 right-1.5 z-10" (click)="$event.stopPropagation()">
                <ui-dropdown placement="bottom-end" minWidth="160px">
                  <button trigger type="button"
                    class="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)]
                           bg-black/25 hover:bg-black/50 text-white transition-colors backdrop-blur-sm">
                    <svg lucideMoreVertical [size]="12" color="currentColor" />
                  </button>
                  <ui-dropdown-item (click)="viewFile(file)">
                    <svg lucideEye [size]="14" color="currentColor" />
                    Preview
                  </ui-dropdown-item>
                  <ui-dropdown-item (click)="copyUrl(file)">
                    <svg lucideCopy [size]="14" color="currentColor" />
                    Copy URL
                  </ui-dropdown-item>
                  <ui-dropdown-item (click)="downloadFile(file)">
                    <svg lucideDownload [size]="14" color="currentColor" />
                    Download
                  </ui-dropdown-item>
                  <ui-dropdown-separator />
                  <ui-dropdown-item [danger]="true" (click)="deleteFile(file)">
                    <svg lucideTrash2 [size]="14" color="currentColor" />
                    Delete
                  </ui-dropdown-item>
                </ui-dropdown>
              </div>

              <!-- Info -->
              <div class="p-2 border-t border-[var(--color-border)]">
                <div class="text-xs font-medium text-[var(--color-text-primary)] truncate" [title]="file.name">{{ file.name }}</div>
                <div class="text-[10px] text-[var(--color-text-muted)] mt-0.5">{{ formatSize(file.size) }}</div>
              </div>
            </div>
          }
        </div>

        <!-- Grid pagination -->
        @if (filteredFiles().length > pageSize) {
          <div class="mt-4 pt-4 border-t border-[var(--color-border)]">
            <ui-pagination [page]="currentPage()" [pageSize]="pageSize" [total]="filteredFiles().length" (pageChange)="currentPage.set($event)" />
          </div>
        }
      }

      <!-- ── List View ──────────────────────────────────────────────── -->
      @if (viewMode() === 'list') {
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden">
          <table class="w-full">
            <thead class="bg-[var(--color-neutral-50)] dark:bg-[var(--color-bg-elevated)]">
              <tr>
                <th class="w-10 px-4 py-3">
                  <input type="checkbox" class="rounded border-[var(--color-border)] accent-[var(--color-primary-600)]"
                         (change)="toggleAll($event)" [checked]="allSelected()" />
                </th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">File</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Type</th>
                <th class="text-right text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Size</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Uploaded By</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Date</th>
                <th class="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-border)]">
              @for (file of pagedFiles(); track file.id) {
                <tr class="hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors">
                  <td class="px-4 py-3">
                    <input type="checkbox" class="rounded border-[var(--color-border)] accent-[var(--color-primary-600)]"
                           [checked]="selectedIds().has(file.id)"
                           (change)="toggleCheck(file.id, $event)" />
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-[var(--radius)] flex items-center justify-center shrink-0" [class]="filePreviewBg(file.type)">
                        <svg [lucideIcon]="fileIcon(file.type)" [size]="14" color="currentColor" [class]="fileIconColor(file.type)" />
                      </div>
                      <div>
                        <div class="text-sm font-medium text-[var(--color-text-primary)]">{{ file.name }}</div>
                        @if (file.dimensions) {
                          <div class="text-xs text-[var(--color-text-muted)]">{{ file.dimensions }}</div>
                        }
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-xs font-mono text-[var(--color-text-muted)] uppercase">{{ file.ext }}</span>
                  </td>
                  <td class="px-4 py-3 text-right text-sm text-[var(--color-text-muted)]">{{ formatSize(file.size) }}</td>
                  <td class="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{{ file.uploadedBy }}</td>
                  <td class="px-4 py-3 text-sm text-[var(--color-text-muted)]">{{ file.uploadedAt }}</td>
                  <!-- Always-visible action dropdown -->
                  <td class="px-4 py-3 text-right">
                    <ui-dropdown placement="bottom-end" minWidth="160px">
                      <button trigger type="button"
                        class="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)]
                               hover:text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)]
                               dark:hover:bg-[var(--color-bg-elevated)] transition-colors">
                        <svg lucideMoreVertical [size]="14" color="currentColor" />
                      </button>
                      <ui-dropdown-item (click)="viewFile(file)">
                        <svg lucideEye [size]="14" color="currentColor" />
                        Preview
                      </ui-dropdown-item>
                      <ui-dropdown-item (click)="copyUrl(file)">
                        <svg lucideCopy [size]="14" color="currentColor" />
                        Copy URL
                      </ui-dropdown-item>
                      <ui-dropdown-item (click)="downloadFile(file)">
                        <svg lucideDownload [size]="14" color="currentColor" />
                        Download
                      </ui-dropdown-item>
                      <ui-dropdown-separator />
                      <ui-dropdown-item [danger]="true" (click)="deleteFile(file)">
                        <svg lucideTrash2 [size]="14" color="currentColor" />
                        Delete
                      </ui-dropdown-item>
                    </ui-dropdown>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          <!-- List pagination -->
          <div class="px-6 py-4 border-t border-[var(--color-border)]">
            <ui-pagination [page]="currentPage()" [pageSize]="pageSize" [total]="filteredFiles().length" (pageChange)="currentPage.set($event)" />
          </div>
        </div>
      }
    }
  `
})
export class MediaComponent implements OnInit {
  private layout = inject(LayoutService);
  private toast = inject(ToastService);

  viewMode = signal<ViewMode>('grid');
  typeFilter = signal<MediaType>('all');
  searchQuery = '';
  sortBy = 'date_desc';
  selectedIds = signal<Set<number>>(new Set());
  currentPage = signal(1);
  pageSize = 24;

  storageBreakdown = [
    { label: 'Images', size: '2.1 GB', color: '#4f46e5' },
    { label: 'Videos', size: '1.3 GB', color: '#10b981' },
    { label: 'Documents', size: '0.5 GB', color: '#f59e0b' },
    { label: 'Other', size: '0.3 GB', color: '#6b7280' },
  ];

  typeTabs = [
    { label: 'All', value: 'all' as MediaType },
    { label: 'Images', value: 'image' as MediaType },
    { label: 'Videos', value: 'video' as MediaType },
    { label: 'Documents', value: 'document' as MediaType },
    { label: 'Audio', value: 'audio' as MediaType },
  ];

  allFiles = signal<MediaFile[]>([
    { id: 1, name: 'hero-banner.jpg', type: 'image', ext: 'jpg', size: 2457600, dimensions: '1920×1080', uploadedBy: 'Alex Johnson', uploadedAt: 'Dec 13, 2024' },
    { id: 2, name: 'product-headphones.png', type: 'image', ext: 'png', size: 1638400, dimensions: '800×800', uploadedBy: 'Sarah Williams', uploadedAt: 'Dec 12, 2024' },
    { id: 3, name: 'team-photo.jpg', type: 'image', ext: 'jpg', size: 3276800, dimensions: '2400×1600', uploadedBy: 'Lisa Martinez', uploadedAt: 'Dec 11, 2024' },
    { id: 4, name: 'intro-video.mp4', type: 'video', ext: 'mp4', size: 52428800, dimensions: '1920×1080', uploadedBy: 'Michael Chen', uploadedAt: 'Dec 10, 2024' },
    { id: 5, name: 'annual-report-2024.pdf', type: 'document', ext: 'pdf', size: 4194304, uploadedBy: 'Alex Johnson', uploadedAt: 'Dec 9, 2024' },
    { id: 6, name: 'brand-guidelines.pdf', type: 'document', ext: 'pdf', size: 8388608, uploadedBy: 'Sarah Williams', uploadedAt: 'Dec 8, 2024' },
    { id: 7, name: 'logo-full.svg', type: 'image', ext: 'svg', size: 12288, dimensions: 'Vector', uploadedBy: 'Alex Johnson', uploadedAt: 'Dec 7, 2024' },
    { id: 8, name: 'podcast-ep1.mp3', type: 'audio', ext: 'mp3', size: 26214400, uploadedBy: 'Lisa Martinez', uploadedAt: 'Dec 6, 2024' },
    { id: 9, name: 'product-keyboard.jpg', type: 'image', ext: 'jpg', size: 1843200, dimensions: '1200×900', uploadedBy: 'Michael Chen', uploadedAt: 'Dec 5, 2024' },
    { id: 10, name: 'pitch-deck.pptx', type: 'document', ext: 'pptx', size: 16777216, uploadedBy: 'Alex Johnson', uploadedAt: 'Dec 4, 2024' },
    { id: 11, name: 'feature-demo.mp4', type: 'video', ext: 'mp4', size: 104857600, dimensions: '1280×720', uploadedBy: 'Sarah Williams', uploadedAt: 'Dec 3, 2024' },
    { id: 12, name: 'og-image.png', type: 'image', ext: 'png', size: 204800, dimensions: '1200×630', uploadedBy: 'Alex Johnson', uploadedAt: 'Dec 2, 2024' },
    { id: 13, name: 'user-research.xlsx', type: 'document', ext: 'xlsx', size: 2097152, uploadedBy: 'Lisa Martinez', uploadedAt: 'Dec 1, 2024' },
    { id: 14, name: 'background-music.mp3', type: 'audio', ext: 'mp3', size: 7340032, uploadedBy: 'Michael Chen', uploadedAt: 'Nov 30, 2024' },
    { id: 15, name: 'icon-set.zip', type: 'archive', ext: 'zip', size: 1048576, uploadedBy: 'Alex Johnson', uploadedAt: 'Nov 29, 2024' },
    { id: 16, name: 'product-desk.jpg', type: 'image', ext: 'jpg', size: 2621440, dimensions: '1440×960', uploadedBy: 'Sarah Williams', uploadedAt: 'Nov 28, 2024' },
    { id: 17, name: 'privacy-policy.docx', type: 'document', ext: 'docx', size: 524288, uploadedBy: 'Alex Johnson', uploadedAt: 'Nov 27, 2024' },
    { id: 18, name: 'product-shoes.jpg', type: 'image', ext: 'jpg', size: 1966080, dimensions: '900×900', uploadedBy: 'Lisa Martinez', uploadedAt: 'Nov 26, 2024' },
  ]);

  filteredFiles = computed(() => {
    const q = this.searchQuery.toLowerCase();
    return this.allFiles().filter(f =>
      (this.typeFilter() === 'all' || f.type === this.typeFilter()) &&
      (!q || f.name.toLowerCase().includes(q))
    );
  });

  pagedFiles = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredFiles().slice(start, start + this.pageSize);
  });

  allSelected = computed(() =>
    this.filteredFiles().length > 0 && this.filteredFiles().every(f => this.selectedIds().has(f.id))
  );

  typeCount(type: MediaType): number {
    return type === 'all' ? this.allFiles().length : this.allFiles().filter(f => f.type === type).length;
  }

  ngOnInit() {
    this.layout.setPage('Media', [{ label: 'Content' }, { label: 'Media' }]);
  }

  fileIcon(type: MediaType): string {
    return ({ image: 'image', video: 'film', document: 'file-text', audio: 'music', archive: 'archive' } as Record<string, string>)[type] || 'file-text';
  }

  filePreviewBg(type: MediaType): string {
    return ({ image: 'bg-purple-50 dark:bg-purple-900/20', video: 'bg-blue-50 dark:bg-blue-900/20', document: 'bg-amber-50 dark:bg-amber-900/20', audio: 'bg-green-50 dark:bg-green-900/20', archive: 'bg-gray-50 dark:bg-gray-900/20' } as Record<string, string>)[type] || 'bg-gray-50';
  }

  fileIconColor(type: MediaType): string {
    return ({ image: 'text-purple-500', video: 'text-blue-500', document: 'text-amber-500', audio: 'text-green-500', archive: 'text-gray-500' } as Record<string, string>)[type] || 'text-gray-500';
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
  }

  toggleFileSelect(id: number) {
    this.selectedIds.update(set => { const next = new Set(set); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  toggleAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedIds.set(checked ? new Set(this.filteredFiles().map(f => f.id)) : new Set());
  }

  toggleCheck(id: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedIds.update(set => { const next = new Set(set); checked ? next.add(id) : next.delete(id); return next; });
  }

  triggerUpload() { this.toast.info('Upload', 'File picker would open here. Drag & drop also supported.'); }
  viewFile(f: MediaFile) { this.toast.info('Preview', `Opening preview for ${f.name}.`); }
  copyUrl(f: MediaFile) { this.toast.success('Copied!', `URL for ${f.name} copied to clipboard.`); }
  downloadFile(f: MediaFile) { this.toast.info('Download', `Downloading ${f.name}.`); }

  deleteFile(f: MediaFile) {
    this.allFiles.update(files => files.filter(x => x.id !== f.id));
    this.toast.success('Deleted', `${f.name} has been removed.`);
  }

  bulkDownload() { this.toast.info('Bulk download', `Downloading ${this.selectedIds().size} files as ZIP.`); }

  bulkDelete() {
    const count = this.selectedIds().size;
    this.allFiles.update(files => files.filter(f => !this.selectedIds().has(f.id)));
    this.selectedIds.set(new Set());
    this.toast.success('Files deleted', `${count} files have been removed.`);
  }

  resetSelectedIds() { this.selectedIds.set(new Set()); }
}
