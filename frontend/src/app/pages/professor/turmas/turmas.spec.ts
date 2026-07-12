import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurmasProfessorComponent } from './turmas';

describe('TurmasProfessorComponent', () => {
  let component: TurmasProfessorComponent;
  let fixture: ComponentFixture<TurmasProfessorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurmasProfessorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TurmasProfessorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
