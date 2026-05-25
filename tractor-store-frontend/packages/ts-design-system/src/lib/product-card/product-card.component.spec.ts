import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCardComponent } from './product-card.component';

describe('ProductCardComponent', () => {
  let fixture: ComponentFixture<ProductCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductCardComponent);
    fixture.componentRef.setInput('name', 'Test Tractor');
    fixture.componentRef.setInput('imageUrl', 'https://example.com/img.webp');
    fixture.componentRef.setInput('price', 1000);
    fixture.detectChanges();
  });

  it('should render name and price', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Test Tractor');
    expect(el.textContent).toContain('1,000');
  });

  it('should emit selected on click', () => {
    const spy = jest.fn();
    fixture.componentInstance.selected.subscribe(spy);
    fixture.nativeElement.querySelector('article')?.click();
    expect(spy).toHaveBeenCalled();
  });
});
