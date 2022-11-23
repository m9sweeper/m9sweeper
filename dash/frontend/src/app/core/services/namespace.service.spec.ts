import { TestBed } from '@angular/core/testing';

import { NamespaceService } from './namespace.service';

describe('NamespaceService', () => {
  let service: NamespaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NamespaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
