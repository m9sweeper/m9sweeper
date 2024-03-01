import { TestBed } from '@angular/core/testing';
import { LoginGuard } from './login.guard';
import {CanActivateFn} from '@angular/router';

describe('LoginGuard', () => {
  let guard: CanActivateFn;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = LoginGuard;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
