import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClusterEditComponent } from './cluster-edit.component';

describe('ClusterCreateComponent', () => {
  let component: ClusterEditComponent;
  let fixture: ComponentFixture<ClusterEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClusterEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
