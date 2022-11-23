import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnumService {
  constructor(
  ){}

  /** Get an array of values for a given enum for iterable purposes */
  getEnumValues<T>(targetEnum): T[] {
    return Object.values(targetEnum);
  }
}
