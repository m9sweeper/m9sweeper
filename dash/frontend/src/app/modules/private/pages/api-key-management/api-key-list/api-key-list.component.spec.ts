import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiKeyListComponent } from './api-key-list.component';

describe('ApiKeyListComponent', () => {
  let component: ApiKeyListComponent;
  let fixture: ComponentFixture<ApiKeyListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApiKeyListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiKeyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
