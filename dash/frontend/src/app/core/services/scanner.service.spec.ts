import { TestBed } from '@angular/core/testing';

import { ScannerService } from './scanner.service';

describe('ScannerService', () => {
  let service: ScannerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScannerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
