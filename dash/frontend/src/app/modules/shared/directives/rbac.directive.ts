import {Directive, ElementRef, Input, OnInit, Renderer2} from '@angular/core';
import {JwtAuthService} from '../../../core/services/jwt-auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[allowedRoles]'
})
export class RbacDirective implements OnInit {

  @Input('allowedRoles') allowedRoles: string[];

  constructor(private readonly el: ElementRef,
              private readonly jwtAuthService: JwtAuthService,
              private readonly snackBar: MatSnackBar,
              private readonly renderer: Renderer2) {
  }

  ngOnInit(): void {
    const currentUserRoles = this.jwtAuthService.currentUserAuthorities as string[];
    const isAllowed = this.allowedRoles.filter(r => currentUserRoles.includes(r))?.length > 0;
    if (!isAllowed) {
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
      this.renderer.listen(this.el.nativeElement, 'click', (event) => {
        event.stopPropagation();
        this.snackBar.open('Access denied!', 'Close');
        return false;
      });
    }
  }

}
