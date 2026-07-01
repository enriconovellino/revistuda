import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloDetalheComponent } from './modulo-detalhe.component';

describe('ModuloDetalheComponent', () => {
  let component: ModuloDetalheComponent;
  let fixture: ComponentFixture<ModuloDetalheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuloDetalheComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModuloDetalheComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
