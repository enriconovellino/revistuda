import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTurmas } from './dashboard-turmas';

describe('DashboardTurmas', () => {
  let component: DashboardTurmas;
  let fixture: ComponentFixture<DashboardTurmas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTurmas],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardTurmas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
