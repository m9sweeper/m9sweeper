import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateUserProfileComponent } from './update-user-profile.component';

describe('UpdateUserProfileComponent', () => {
  let component: UpdateUserProfileComponent;
  let fixture: ComponentFixture<UpdateUserProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateUserProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateUserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
