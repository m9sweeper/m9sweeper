import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import {CanActivateFn} from '@angular/router';

describe('AuthGuard', () => {
  let guard: CanActivateFn;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = AuthGuard;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
