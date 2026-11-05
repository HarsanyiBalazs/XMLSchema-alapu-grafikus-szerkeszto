import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Xmlvalidator } from './xmlvalidator';

describe('Xmlvalidator', () => {
  let component: Xmlvalidator;
  let fixture: ComponentFixture<Xmlvalidator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Xmlvalidator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Xmlvalidator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
