import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaitlistModalComponent } from './waitlist-modal.page';

describe('WaitlistModalComponent', () => {
  let component: WaitlistModalComponent;
  let fixture: ComponentFixture<WaitlistModalComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WaitlistModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
