import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageIssueMoreDataDialogComponent } from './image-issue-more-data-dialog.component';

describe('ImageIssueMoreDataDialogComponent', () => {
  let component: ImageIssueMoreDataDialogComponent;
  let fixture: ComponentFixture<ImageIssueMoreDataDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageIssueMoreDataDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageIssueMoreDataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
