import { TestBed } from '@angular/core/testing';

import { EmspService } from './emsp.service';

describe('EmspService', () => {
  let service: EmspService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmspService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
