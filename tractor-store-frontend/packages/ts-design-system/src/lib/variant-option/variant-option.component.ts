import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ts-variant-option',
  standalone: true,
  template: `
    <button
      type="button"
      class="w-11 h-11 rounded-full border-2 transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
      [class.border-brand-accent]="selected()"
      [class.border-border]="!selected()"
      [class.ring-2]="selected()"
      [class.ring-brand-accent]="selected()"
      [class.ring-offset-2]="selected()"
      [style.background-color]="color()"
      [attr.aria-label]="label()"
      [attr.aria-pressed]="selected()"
      (click)="select.emit()"
    ></button>
  `,
})
export class VariantOptionComponent {
  readonly color = input.required<string>();
  readonly label = input.required<string>();
  readonly selected = input(false);
  readonly select = output<void>();
}
