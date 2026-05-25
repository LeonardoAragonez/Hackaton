import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly message = signal<string | null>(null);
  readonly kind = signal<ToastKind>('success');
  readonly visible = signal(false);

  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  show(message: string, kind: ToastKind = 'success', durationMs = 4200): void {
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.message.set(message);
    this.kind.set(kind);
    this.visible.set(true);
    this.hideTimer = setTimeout(() => this.dismiss(), durationMs);
  }

  dismiss(): void {
    this.visible.set(false);
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
