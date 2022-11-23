import { TestBed } from '@angular/core/testing';

import { PodService } from './pod.service';

describe('PodService', () => {
  let service: PodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
