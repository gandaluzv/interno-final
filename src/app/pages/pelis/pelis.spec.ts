import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pelis } from './pelis';

describe('Pelis', () => {
  let component: Pelis;
  let fixture: ComponentFixture<Pelis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pelis],
    }).compileComponents();

    fixture = TestBed.createComponent(Pelis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
