import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KubeBenchDialogComponent } from './kube-bench-dialog.component';

describe('KubeBenchDialogComponent', () => {
  let component: KubeBenchDialogComponent;
  let fixture: ComponentFixture<KubeBenchDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KubeBenchDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KubeBenchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
