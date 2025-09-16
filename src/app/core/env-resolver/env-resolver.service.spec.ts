import { TestBed } from '@angular/core/testing';

import { EnvResolverService } from './env-resolver.service';

describe('EnvResolverService', () => {
  let service: EnvResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
