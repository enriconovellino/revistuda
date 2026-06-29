import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloDetalhe } from './modulo-detalhe';

describe('ModuloDetalhe', () => {
  let component: ModuloDetalhe;
  let fixture: ComponentFixture<ModuloDetalhe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuloDetalhe],
    }).compileComponents();

    fixture = TestBed.createComponent(ModuloDetalhe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
