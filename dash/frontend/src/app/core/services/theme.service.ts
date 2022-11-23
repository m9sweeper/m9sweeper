import { Injectable } from '@angular/core';
import {ITheme} from '../entities/ITheme';
import {BehaviorSubject, Observable} from 'rxjs';
import {DefaultThemes} from '../enum/DefaultThemes';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private themeSubject = new BehaviorSubject(null);
  private currentTheme = this.themeSubject.asObservable();

  constructor() {
    this.changeTheme(this.getStoredTheme() || this.getTheme(DefaultThemes.Default));
  }

  get theme(): Observable<ITheme> {
    return this.currentTheme;
  }

  getStoredTheme(): ITheme {
    const theme = localStorage.getItem('theme');
    if (theme !== null){
      return JSON.parse(theme);
    }
    return null;
  }

  getTheme(theme: DefaultThemes): ITheme {
    switch (theme) {
      case DefaultThemes.Dark:
        return {name: 'Dark', cssClass: 'dark-theme'};
      case DefaultThemes.Default:
        return {name: 'Default', cssClass: 'default-theme'};
    }
  }

  setStoredTheme(theme: ITheme){
    localStorage.setItem('theme', JSON.stringify(theme));
  }

  changeTheme(theme: ITheme) {
    this.setStoredTheme(theme);
    this.applyTheme(theme);
    this.themeSubject.next(theme);
  }

  applyTheme(theme: ITheme) {
    const cssClass = theme.cssClass;
    const oldCLass = [];
    const body = document.getElementsByTagName('body')[0];
    body.classList.forEach(className => {
      if (className.indexOf('-theme') > -1) {
        oldCLass.push(className);
      }
    });
    body.classList.remove(...oldCLass);
    body.classList.add(cssClass);
  }

}
