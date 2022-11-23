import { TestBed } from '@angular/core/testing';

import { DockerRegistriesService } from './docker-registries.service';

describe('DockerRegistriesService', () => {
  let service: DockerRegistriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DockerRegistriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
