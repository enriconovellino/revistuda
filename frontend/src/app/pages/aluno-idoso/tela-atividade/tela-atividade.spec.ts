import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TelaAtividade } from './tela-atividade';

describe('TelaAtividade', () => {
  let component: TelaAtividade;
  let fixture: ComponentFixture<TelaAtividade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelaAtividade],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TelaAtividade);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
