import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgmEditConditionComponent } from './pgm-edit-condition.component';

describe('PgmEditConditionComponent', () => {
  let component: PgmEditConditionComponent;
  let fixture: ComponentFixture<PgmEditConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PgmEditConditionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PgmEditConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
