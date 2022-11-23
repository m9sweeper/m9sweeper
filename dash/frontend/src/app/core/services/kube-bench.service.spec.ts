import { TestBed } from '@angular/core/testing';

import { KubeBenchService } from './kube-bench.service';

describe('KubeBenchService', () => {
  let service: KubeBenchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KubeBenchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
