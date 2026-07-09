import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTurmasComponent } from './dashboard-turmas.component';

describe('DashboardTurmasComponent', () => {
  let component: DashboardTurmasComponent;
  let fixture: ComponentFixture<DashboardTurmasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTurmasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardTurmasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
