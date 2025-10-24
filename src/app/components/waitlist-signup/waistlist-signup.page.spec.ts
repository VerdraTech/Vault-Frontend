import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaitlistSignupComponent } from './waistlist-signup.page';

describe('SignupPage', () => {
  let component: WaitlistSignupComponent;
  let fixture: ComponentFixture<WaitlistSignupComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WaitlistSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
