import { TestBed } from '@angular/core/testing';

import { FormGenerator } from './form-generator';

describe('FormGenerator', () => {
  let service: FormGenerator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormGenerator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
