import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendResetPasswordMailComponent } from './send-reset-password-mail.component';

describe('ResetPasswordComponent', () => {
  let component: SendResetPasswordMailComponent;
  let fixture: ComponentFixture<SendResetPasswordMailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendResetPasswordMailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendResetPasswordMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
