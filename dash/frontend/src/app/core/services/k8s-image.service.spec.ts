import { TestBed } from '@angular/core/testing';

import { K8sImageService } from './k8s-image.service';

describe('K8sImageService', () => {
  let service: K8sImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(K8sImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
