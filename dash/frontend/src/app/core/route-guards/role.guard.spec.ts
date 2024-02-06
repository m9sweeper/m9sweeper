import { TestBed } from '@angular/core/testing';
import {CanActivateFn} from '@angular/router';
import {RoleGuard} from './role.guard';

describe('RoleGuard', () => {
  let guard: CanActivateFn;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = RoleGuard;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
