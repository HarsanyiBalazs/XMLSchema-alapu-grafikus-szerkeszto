import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Createxmlform } from './createxmlform';

describe('Createxmlform', () => {
  let component: Createxmlform;
  let fixture: ComponentFixture<Createxmlform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Createxmlform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Createxmlform);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
