import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VariantOptionComponent } from './variant-option.component';

describe('VariantOptionComponent', () => {
  let fixture: ComponentFixture<VariantOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariantOptionComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(VariantOptionComponent);
    fixture.componentRef.setInput('color', '#ff0000');
    fixture.componentRef.setInput('label', 'Red');
    fixture.detectChanges();
  });

  it('should emit select on click', () => {
    const spy = jest.fn();
    fixture.componentInstance.select.subscribe(spy);
    fixture.nativeElement.querySelector('button').click();
    expect(spy).toHaveBeenCalled();
  });
});
