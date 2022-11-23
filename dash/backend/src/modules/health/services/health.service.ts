import { Injectable } from '@nestjs/common';
import { HealthDao } from "../dao/health.dao";

@Injectable()
export class HealthService {
  constructor(private readonly healthDao: HealthDao){}

  async getDatabaseStatus(): Promise<any> {
    return this.healthDao.getDatabaseStatus();
  }
}
