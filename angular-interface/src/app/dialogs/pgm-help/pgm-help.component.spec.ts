import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgmHelpComponent } from './pgm-help.component';

describe('PgmHelpComponent', () => {
  let component: PgmHelpComponent;
  let fixture: ComponentFixture<PgmHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PgmHelpComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PgmHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
