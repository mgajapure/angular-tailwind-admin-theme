import {
  ComponentRef, Directive, ElementRef, HostListener,
  OnDestroy, ViewContainerRef, inject, input
} from '@angular/core';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TooltipPanelComponent } from './tooltip-panel.component';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

/**
 * Positions for each placement — first entry is preferred, second is the
 * auto-flip fallback when the preferred position would overflow the viewport.
 */
const TOOLTIP_POSITIONS: Record<TooltipPlacement, ConnectedPosition[]> = {
  top: [
    { originX: 'center', originY: 'top',    overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top',    offsetY:  8 },
  ],
  bottom: [
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top',    offsetY:  8 },
    { originX: 'center', originY: 'top',    overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
  ],
  left: [
    { originX: 'start',  originY: 'center', overlayX: 'end',    overlayY: 'center', offsetX: -8 },
    { originX: 'end',    originY: 'center', overlayX: 'start',  overlayY: 'center', offsetX:  8 },
  ],
  right: [
    { originX: 'end',    originY: 'center', overlayX: 'start',  overlayY: 'center', offsetX:  8 },
    { originX: 'start',  originY: 'center', overlayX: 'end',    overlayY: 'center', offsetX: -8 },
  ],
};

/**
 * Tooltip directive — attach to any element to show a floating label.
 *
 * Usage:
 *   <button uiTooltip="Save changes">Save</button>
 *   <button uiTooltip="Delete" uiTooltipPlacement="bottom">Delete</button>
 *   <button [uiTooltip]="dynamicText" [uiTooltipDisabled]="isLoading">...</button>
 *
 * The tooltip:
 *   - Appears after a 200 ms delay (prevents flicker during fast mouse moves)
 *   - Auto-flips to the opposite side when it would overflow the viewport
 *   - Repositions on scroll
 *   - Is keyboard accessible (shows on focusin, hides on focusout)
 *   - Sets aria-describedby on the host element while visible
 *   - Renders into a CDK overlay pane at <body> level (no overflow clipping)
 */
@Directive({
  selector: '[uiTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  /** Tooltip text. Pass null / undefined / empty string to disable. */
  uiTooltip = input<string | null | undefined>('');

  /** Which side to prefer. Auto-flips to the opposite side near viewport edges. */
  uiTooltipPlacement = input<TooltipPlacement>('top');

  /** Suppress the tooltip entirely (e.g. when a button is loading). */
  uiTooltipDisabled = input(false);

  private el      = inject(ElementRef<HTMLElement>);
  private overlay = inject(Overlay);
  private vcr     = inject(ViewContainerRef);

  private overlayRef: OverlayRef | null = null;
  private panelRef:   ComponentRef<TooltipPanelComponent> | null = null;
  private showTimer:  ReturnType<typeof setTimeout> | null = null;
  private tooltipId = `ui-tooltip-${Math.random().toString(36).slice(2, 8)}`;

  // ── Show / hide triggers ───────────────────────────────────────────────────

  @HostListener('mouseenter')
  @HostListener('focusin')
  onShow(): void {
    if (this.uiTooltipDisabled() || !this.uiTooltip()) return;
    this.clearTimer();
    this.showTimer = setTimeout(() => this.open(), 200);
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  onHide(): void {
    this.clearTimer();
    this.close();
  }

  // ── Overlay lifecycle ──────────────────────────────────────────────────────

  private open(): void {
    if (this.overlayRef) return;

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.el)
      .withPositions(TOOLTIP_POSITIONS[this.uiTooltipPlacement()])
      .withPush(true);          // nudge instead of clipping near viewport edge

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop:    false,    // no backdrop — tooltip hides on mouseleave
    });

    // Render the panel component into the overlay pane
    this.panelRef = this.overlayRef.attach(
      new ComponentPortal(TooltipPanelComponent, this.vcr)
    );
    this.panelRef.instance.text.set(this.uiTooltip() ?? '');
    this.panelRef.changeDetectorRef.markForCheck();

    // Accessibility: link tooltip to trigger via aria-describedby
    this.panelRef.location.nativeElement.id = this.tooltipId;
    this.el.nativeElement.setAttribute('aria-describedby', this.tooltipId);
  }

  private close(): void {
    if (!this.overlayRef) return;
    this.overlayRef.dispose();
    this.overlayRef = null;
    this.panelRef   = null;
    this.el.nativeElement.removeAttribute('aria-describedby');
  }

  private clearTimer(): void {
    if (this.showTimer !== null) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.close();
  }
}
