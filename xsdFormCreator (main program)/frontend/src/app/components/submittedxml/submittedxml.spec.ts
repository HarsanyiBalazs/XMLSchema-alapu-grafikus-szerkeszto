import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Submittedxml } from './submittedxml';

describe('Submittedxml', () => {
  let component: Submittedxml;
  let fixture: ComponentFixture<Submittedxml>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Submittedxml]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Submittedxml);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
