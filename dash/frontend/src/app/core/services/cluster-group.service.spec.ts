import { TestBed } from '@angular/core/testing';

import { ClusterGroupService } from './cluster-group.service';

describe('ClusterGroupService', () => {
  let service: ClusterGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClusterGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
