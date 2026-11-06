import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Xmlform } from './xmlform';

describe('Xmlform', () => {
  let component: Xmlform;
  let fixture: ComponentFixture<Xmlform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Xmlform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Xmlform);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
