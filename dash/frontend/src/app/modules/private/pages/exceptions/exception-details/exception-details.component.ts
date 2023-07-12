import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@full-fledged/alerts';
import { ExceptionsService } from '../../../../../core/services/exceptions.service';
import { IException } from '../../../../../core/entities/IException';
import { CommentService } from '../../../../../core/services/comment.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { JwtAuthService } from '../../../../../core/services/jwt-auth.service';
import { IComment } from '../../../../../core/entities/IComment';
import { Observable } from 'rxjs';
import {AlertDialogComponent} from '../../../../shared/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-exception-details',
  templateUrl: './exception-details.component.html',
  styleUrls: ['./exception-details.component.scss']
})
export class ExceptionDetailsComponent implements OnInit {
  exceptionId: number;
  exception: IException;
  commentForm: FormGroup;
  comments$: Observable<IComment[]>;
  isSubmitting = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private exceptionsService: ExceptionsService,
    private commentService: CommentService,
    private formBuilder: FormBuilder,
    private jwtAuthService: JwtAuthService,
    public dialog: MatDialog) {
    this.commentForm = this.formBuilder.group({
      comment: ['',
        {
          validators: [Validators.required],
      }]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.exceptionId = params.id;
      this.getExceptionDetails(this.exceptionId);
      this.getAllComments();
    });
  }

  getExceptionDetails(id: number) {
    this.exceptionsService.getExceptionById(id).subscribe(
      response => {this.exception = response.data[0]; console.log(this.exception); },
        error => console.log(error));
  }

  editException() {
    this.router.navigate(['/private', 'exceptions', this.exceptionId, 'edit']);
  }

  getAllComments() {
    this.comments$ = this.commentService.getAllComments(this.exceptionId);
  }

  deleteException() {
    const confirmModal = this.dialog.open(AlertDialogComponent, {
      width: '400px',
      closeOnNavigation: true,
      disableClose: true
    });

    confirmModal.afterClosed().subscribe(result => {
      if (result === true) {
        this.exceptionsService.deleteExceptionById(this.exceptionId).subscribe(
          _ => {
            this.router.navigate(['/private', 'exceptions']);
            this.alertService.success('Exception deleted');
          },
          _ => this.alertService.danger('Something went wrong. Please try again later')
        );
      }
    });
  }

  viewCluster(clusterId: number) {
    this.router.navigate(['/private', 'clusters', clusterId, 'summary']);
  }

  viewPolicy(policyId: number) {
    // @TODO: Change this to go to the details/info page if that is ever created
    this.router.navigate(['/private' , 'policies', policyId, 'edit']);
  }

  onSubmit() {
    console.log(this.commentForm.value);
    this.isSubmitting = true;
    const currentUser = this.jwtAuthService.currentUser;
    const comment: IComment = {
      content : this.commentForm.controls.comment.value,
      userId: currentUser.id,
      exceptionId: Number(this.exceptionId)
    };
    this.commentService.createComment(comment).subscribe(() => {
      this.reset();
      this.getAllComments();
    }, () => {
      this.alertService.warning('Something went wrong. Cannot post message');
    }, () => {
      this.isSubmitting = false;
    });
  }
  reset() {
    this.commentForm.controls.comment.reset(null);
  }

  deleteComment(comment: IComment) {
    const deleteCommentDialog = this.dialog.open(AlertDialogComponent, {
      width: '400px',
      closeOnNavigation: true,
      disableClose: true,
      data: {
        functionToRun: this.commentService.deleteComment(comment.id),
        afterRoute: [],
        reload: false
      }
    });

    deleteCommentDialog.afterClosed().subscribe(result => {
      console.log(result);
      if (result) {
        this.getAllComments();
      }
    });
  }
}
