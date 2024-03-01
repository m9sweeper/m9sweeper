import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateImageComponent } from './create-image.component';

describe('PostImageComponent', () => {
  let component: CreateImageComponent;
  let fixture: ComponentFixture<CreateImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
