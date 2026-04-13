import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscountMapPage } from './discount-map.page';

describe('DiscountMapPage', () => {
  let component: DiscountMapPage;
  let fixture: ComponentFixture<DiscountMapPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
