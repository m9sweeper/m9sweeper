import { TestBed } from '@angular/core/testing';

import { DeploymentService } from './deployment.service';

describe('DeploymentService', () => {
  let service: DeploymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeploymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
