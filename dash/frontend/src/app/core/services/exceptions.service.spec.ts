import { TestBed } from '@angular/core/testing';
import {ExceptionsService} from './exceptions.service';

describe('ExceptionsService', () => {
  let service: ExceptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExceptionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
