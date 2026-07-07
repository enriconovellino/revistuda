import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtividadesProfessor } from './atividades-professor';

describe('AtividadesProfessor', () => {
  let component: AtividadesProfessor;
  let fixture: ComponentFixture<AtividadesProfessor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtividadesProfessor],
    }).compileComponents();

    fixture = TestBed.createComponent(AtividadesProfessor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
