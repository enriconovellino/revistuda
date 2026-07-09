import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtividadesProfessorComponent } from './atividades-professor.component';

describe('AtividadesProfessorComponent', () => {
  let component: AtividadesProfessorComponent;
  let fixture: ComponentFixture<AtividadesProfessorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtividadesProfessorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AtividadesProfessorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
