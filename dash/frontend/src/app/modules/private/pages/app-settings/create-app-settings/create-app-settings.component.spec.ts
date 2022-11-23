import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAppSettingsComponent } from './create-app-settings.component';

describe('CreateAppSettingsComponent', () => {
  let component: CreateAppSettingsComponent;
  let fixture: ComponentFixture<CreateAppSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAppSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAppSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
