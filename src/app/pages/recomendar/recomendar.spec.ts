import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recomendar } from './recomendar';

describe('Recomendar', () => {
  let component: Recomendar;
  let fixture: ComponentFixture<Recomendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recomendar],
    }).compileComponents();

    fixture = TestBed.createComponent(Recomendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
