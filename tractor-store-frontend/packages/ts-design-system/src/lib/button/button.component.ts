import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ts-button',
  standalone: true,
  host: { class: 'inline-block' },
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      class="w-full"
      [class.ts-btn-primary]="variant() === 'primary'"
      [class.ts-btn-cta]="variant() === 'cta'"
      (click)="clicked.emit($event)"
    >
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly type = input<'button' | 'submit'>('button');
  readonly variant = input<'primary' | 'cta'>('primary');
  readonly disabled = input(false);
  readonly clicked = output<MouseEvent>();
}
