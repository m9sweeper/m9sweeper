import { TestBed } from '@angular/core/testing';

import { ExternalAuthConfigurationService} from './external-auth-configuration.service';

describe('ExternalAuthConfigurationListService', () => {
  let service: ExternalAuthConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExternalAuthConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
