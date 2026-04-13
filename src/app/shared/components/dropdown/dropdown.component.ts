import {
  ChangeDetectionStrategy, Component, ElementRef, OnDestroy,
  TemplateRef, ViewChild, ViewContainerRef, inject, input, signal
} from '@angular/core';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

export type DropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

/**
 * A reusable, accessible dropdown container backed by `@angular/cdk/overlay`.
 *
 * The panel is rendered into a CDK overlay pane that is a direct child of
 * <body>, so it is never clipped by ancestor `overflow: hidden/auto` containers
 * (e.g. table scroll wrappers).
 *
 * Usage:
 *   <ui-dropdown placement="bottom-end" minWidth="180px">
 *     <button trigger ...>Open</button>
 *
 *     <div dropdown-header>Optional header</div>
 *
 *     <ui-dropdown-item (click)="doSomething()">Action</ui-dropdown-item>
 *     <ui-dropdown-separator />
 *     <ui-dropdown-item [danger]="true" (click)="deleteIt()">Delete</ui-dropdown-item>
 *
 *     <div dropdown-footer>Optional footer</div>
 *   </ui-dropdown>
 *
 * The panel closes automatically when:
 *  - Any item inside the panel is clicked (event bubbling → (click)="close()" on panel)
 *  - Escape key is pressed
 *  - A click occurs outside (CDK transparent backdrop)
 */

const PLACEMENT_POSITIONS: Record<DropdownPlacement, ConnectedPosition[]> = {
  'bottom-end': [
    { originX: 'end',   originY: 'bottom', overlayX: 'end',   overlayY: 'top',    offsetY: 6 },
    { originX: 'end',   originY: 'top',    overlayX: 'end',   overlayY: 'bottom', offsetY: -6 },
  ],
  'bottom-start': [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top',    offsetY: 6 },
    { originX: 'start', originY: 'top',    overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
  ],
  'top-end': [
    { originX: 'end',   originY: 'top',    overlayX: 'end',   overlayY: 'bottom', offsetY: -6 },
    { originX: 'end',   originY: 'bottom', overlayX: 'end',   overlayY: 'top',    offsetY: 6 },
  ],
  'top-start': [
    { originX: 'start', originY: 'top',    overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top',    offsetY: 6 },
  ],
};

@Component({
  selector: 'ui-dropdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Trigger — click opens/closes the CDK overlay panel -->
    <div #triggerEl (click)="toggle()" class="inline-flex">
      <ng-content select="[trigger]" />
    </div>

    <!--
      Panel template — attached to a CDK overlay pane at <body> level.
      Content projection (ng-content) is resolved from the component's view
      context, so all slots work correctly even when rendered off-tree.
    -->
    <ng-template #panelTpl>
      <div
        role="menu"
        aria-orientation="vertical"
        (click)="close()"
        class="bg-[var(--color-bg-surface)] border border-[var(--color-border)]
               rounded-[var(--radius-lg)] shadow-[var(--shadow-modal)] animate-scale-in overflow-hidden"
        [style.min-width]="minWidth()">

        <!-- Optional header slot -->
        <ng-content select="[dropdown-header]" />

        <!-- Items -->
        <div class="py-1">
          <ng-content />
        </div>

        <!-- Optional footer slot -->
        <ng-content select="[dropdown-footer]" />
      </div>
    </ng-template>
  `
})
export class DropdownComponent implements OnDestroy {
  /** Which corner of the trigger to anchor the panel to. */
  placement = input<DropdownPlacement>('bottom-end');

  /** Minimum panel width. Pass a CSS value e.g. '200px' or 'auto'. */
  minWidth = input('160px');

  /** Reflects the current open/closed state (useful for host bindings or consumers). */
  isOpen = signal(false);

  @ViewChild('triggerEl') private triggerEl!: ElementRef;
  @ViewChild('panelTpl') private panelTpl!: TemplateRef<void>;

  private overlay = inject(Overlay);
  private vcr    = inject(ViewContainerRef);

  private overlayRef: OverlayRef | null = null;

  toggle() {
    this.isOpen() ? this.close() : this.open();
  }

  open() {
    if (this.overlayRef) return;

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.triggerEl)
      .withPositions(PLACEMENT_POSITIONS[this.placement()])
      .withPush(false);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop:    true,
      backdropClass:  'cdk-overlay-transparent-backdrop',
    });

    // Close on backdrop click (click outside)
    this.overlayRef.backdropClick().subscribe(() => this.close());

    // Close on Escape key
    this.overlayRef.keydownEvents().subscribe(e => {
      if (e.key === 'Escape') this.close();
    });

    this.overlayRef.attach(new TemplatePortal(this.panelTpl, this.vcr));
    this.isOpen.set(true);
  }

  close() {
    if (!this.overlayRef) return;
    this.overlayRef.dispose();
    this.overlayRef = null;
    this.isOpen.set(false);
  }

  ngOnDestroy() {
    this.overlayRef?.dispose();
  }
}
