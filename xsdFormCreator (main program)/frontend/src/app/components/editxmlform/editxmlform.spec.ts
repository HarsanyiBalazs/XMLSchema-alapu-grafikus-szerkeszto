import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Editxmlform } from './editxmlform';

describe('Editxmlform', () => {
  let component: Editxmlform;
  let fixture: ComponentFixture<Editxmlform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Editxmlform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Editxmlform);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
