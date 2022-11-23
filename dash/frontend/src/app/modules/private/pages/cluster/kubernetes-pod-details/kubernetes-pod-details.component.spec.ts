import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KubernetesPodDetailsComponent } from './kubernetes-pod-details.component';

describe('KubernetesPodDetailsComponent', () => {
  let component: KubernetesPodDetailsComponent;
  let fixture: ComponentFixture<KubernetesPodDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KubernetesPodDetailsComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KubernetesPodDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
