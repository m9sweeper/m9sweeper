import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedSubscriptionService{
  private currentExpandStatus = new Subject<boolean>();

  setCurrentExpandStatus(status: boolean){
    this.currentExpandStatus.next(status);
  }

  getCurrentExpandStatus(){
    return this.currentExpandStatus.asObservable();
  }
}
