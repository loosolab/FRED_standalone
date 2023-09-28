import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgmAlertsComponent } from './pgm-alerts.component';

describe('PgmAlertsComponent', () => {
  let component: PgmAlertsComponent;
  let fixture: ComponentFixture<PgmAlertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PgmAlertsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgmAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
