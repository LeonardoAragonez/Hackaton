import { Component, inject } from '@angular/core';
import { ToastService } from '@tractor-store/shared-catalog';

@Component({
  selector: 'ts-toast-host',
  standalone: true,
  template: `
    @if (toast.visible()) {
      <div
        class="ts-toast"
        [class.ts-toast--success]="toast.kind() === 'success'"
        [class.ts-toast--error]="toast.kind() === 'error'"
        [class.ts-toast--info]="toast.kind() === 'info'"
        role="status"
        aria-live="polite"
      >
        <span class="ts-toast__icon" aria-hidden="true">
          @switch (toast.kind()) {
            @case ('success') { ✓ }
            @case ('error') { ! }
            @default { i }
          }
        </span>
        <p class="ts-toast__message">{{ toast.message() }}</p>
        <button type="button" class="ts-toast__close" (click)="toast.dismiss()" aria-label="Cerrar">
          ×
        </button>
      </div>
    }
  `,
})
export class ToastHostComponent {
  readonly toast = inject(ToastService);
}
