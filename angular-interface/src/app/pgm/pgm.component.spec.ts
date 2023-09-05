import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgmComponent } from './pgm.component';

describe('PgmComponent', () => {
  let component: PgmComponent;
  let fixture: ComponentFixture<PgmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PgmComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
