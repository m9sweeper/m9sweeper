import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../shared/services/database.service';

@Injectable()
export class HealthDao {
    constructor(private readonly databaseService: DatabaseService) {}

    async getDatabaseStatus(): Promise<{ postgres: string}> {
        // let healthReport = null;
        const knex = await this.databaseService.getConnection();
        return await knex.raw('select 1+1 as result')
            .then(result => {
                if (+result.rows[0].result === 2) {
                    return { postgres: 'OK'};
                }
            }).catch(error => {
                console.error(error);
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Failed to connect to the database'
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            });
        // return healthReport;
    }
}
