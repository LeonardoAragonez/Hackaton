import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartCounterComponent } from './cart-counter.component';

describe('CartCounterComponent', () => {
  let fixture: ComponentFixture<CartCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartCounterComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CartCounterComponent);
    fixture.detectChanges();
  });

  it('should hide when count is 0', () => {
    const span = fixture.nativeElement.querySelector('span');
    expect(span.classList.contains('hidden')).toBe(true);
  });

  it('should show count', () => {
    fixture.componentRef.setInput('count', 3);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('3');
  });
});
