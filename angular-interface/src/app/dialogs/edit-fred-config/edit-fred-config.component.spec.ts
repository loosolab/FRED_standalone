import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFredConfigComponent } from './edit-fred-config.component';

describe('EditFredConfigComponent', () => {
  let component: EditFredConfigComponent;
  let fixture: ComponentFixture<EditFredConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditFredConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditFredConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
