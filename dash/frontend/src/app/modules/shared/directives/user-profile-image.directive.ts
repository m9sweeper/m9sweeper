import {Directive, ElementRef} from '@angular/core';

@Directive({
  selector: '[appUserProfileImage]'
})
export class UserProfileImageDirective {

  constructor(private el: ElementRef<HTMLImageElement>) {
  }

}
