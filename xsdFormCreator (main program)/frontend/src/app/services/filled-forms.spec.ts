import { TestBed } from '@angular/core/testing';

import { FilledFormsService } from './filled-forms';

describe('FilledFormsService', () => {
  let service: FilledFormsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilledFormsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
