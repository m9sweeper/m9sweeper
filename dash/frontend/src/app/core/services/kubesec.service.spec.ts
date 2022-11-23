import { TestBed } from '@angular/core/testing';

import { KubesecService } from './kubesec.service';

describe('KubesecService', () => {
  let service: KubesecService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KubesecService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
