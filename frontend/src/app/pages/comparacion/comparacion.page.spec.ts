import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComparacionPage } from './comparacion.page';

describe('ComparacionPage', () => {
  let component: ComparacionPage;
  let fixture: ComponentFixture<ComparacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ComparacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
