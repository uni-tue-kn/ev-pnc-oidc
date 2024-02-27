import { TestBed } from '@angular/core/testing';

import { EvService } from './ev.service';

describe('EvService', () => {
  let service: EvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
