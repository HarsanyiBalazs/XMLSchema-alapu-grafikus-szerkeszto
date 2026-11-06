import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Submittedprojects } from './submittedprojects';

describe('Submittedprojects', () => {
  let component: Submittedprojects;
  let fixture: ComponentFixture<Submittedprojects>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Submittedprojects]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Submittedprojects);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
