import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiniCartComponent } from './mini-cart.component';

describe('MiniCartComponent', () => {
  let fixture: ComponentFixture<MiniCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniCartComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MiniCartComponent);
    fixture.componentRef.setInput('itemCount', 2);
    fixture.componentRef.setInput('subtotal', 5000);
    fixture.detectChanges();
  });

  it('should emit navigate on click', () => {
    const spy = jest.fn();
    fixture.componentInstance.navigate.subscribe(spy);
    fixture.nativeElement.querySelector('button').click();
    expect(spy).toHaveBeenCalled();
  });
});
