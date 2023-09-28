import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgmEditFactorsComponent } from './pgm-edit-factors.component';

describe('PgmEditFactorsComponent', () => {
  let component: PgmEditFactorsComponent;
  let fixture: ComponentFixture<PgmEditFactorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PgmEditFactorsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgmEditFactorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
