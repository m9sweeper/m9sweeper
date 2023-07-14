import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  getImageName(imageWithDomainAndRepository: string): string {
    const group = imageWithDomainAndRepository.split('/');
    return group[group.length - 1];
  }

  getImageNameWithRepository(imageWithDomainAndRepository: string): string {
    const regex = /([a-zA-Z0-9]+\.[a-zA-Z0-9\.]+\/)/g;
    const group = imageWithDomainAndRepository.split(regex);
    return group[group.length - 1];
  }
}
