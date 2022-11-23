import {Directive, ElementRef, OnInit} from '@angular/core';
import {UserService} from '../../../core/services/user.service';

@Directive({
  selector: '[appUserProfileImage]'
})
export class UserProfileImageDirective implements OnInit {

  constructor(private el: ElementRef<HTMLImageElement>,
              private readonly userService: UserService) {
  }

  ngOnInit(): void {
    console.log('UserProfileImageDirective->ngOnInit');
  }

}
