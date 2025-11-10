import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VirtualDemoComponent } from './virtual-demo.page';

describe('SignupPage', () => {
  let component: VirtualDemoComponent;
  let fixture: ComponentFixture<VirtualDemoComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
