import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fillxmlform } from './fillxmlform';

describe('Fillxmlform', () => {
  let component: Fillxmlform;
  let fixture: ComponentFixture<Fillxmlform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fillxmlform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fillxmlform);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
