import {Inject, Injectable} from '@nestjs/common';
import * as knexnest from 'knexnest';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from '../../shared/services/database.service';
import { CommentDto } from "../dto/comment-dto";
import {UserProfileDto} from "../../user/dto/user-profile-dto";

@Injectable()
export class CommentDao{
    constructor(private readonly databaseService: DatabaseService,
                @Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto) {}
    async getAllComments(exceptionId: number): Promise<CommentDto[]> {
        const limit = 10;
        const currentUserId = this._loggedInUser.id;
        const knex = await this.databaseService.getConnection();
        const query = knex
            .select([
                'c.id as _id', 'c.content as _content', 'c.exception_id as _exceptionId',
                knex.raw(`CONCAT(u.first_name, ' ', u.last_name ) as _user`),
                knex.raw(`TO_CHAR(TO_TIMESTAMP(c.created_at/1000), 'MM/DD/YYYY HH:MIPM') as "_createdAt"`),
                knex.raw(`(CASE WHEN c.user_id = ${currentUserId} THEN TRUE ELSE FALSE END) as "_canDeleteThisComment"`)
            ])
            .from('exception_comments as c')
            .leftJoin('users as u', function() {
                this.on('c.user_id', '=', 'u.id')
            })
            .where('c.exception_id', exceptionId)
            .andWhere('c.deleted_at', null)
            // .limit(limit)
            // .offset(page * limit) // for pagination
            .orderBy('c.id', 'desc');
        return knexnest(query)
            .then(comments => plainToInstance(CommentDto, comments));
    }

    async createComment(comment: any): Promise<number> {
        const knex = await this.databaseService.getConnection();
        return knex.insert(comment, ['id']).into('exception_comments');
    }

    async getAllUsersToMail(exceptionId: number): Promise<any> {
        const knex = await this.databaseService.getConnection();
        const query = knex.select(
            ['e.title as _title',
                    'u.email as _user__email',
                    knex.raw(`CONCAT(u.first_name, ' ', u.last_name) as _user__fullName`)
            ])
            .from('exception_comments as c')
            .leftJoin('users as u', function(){
                this.on('c.user_id', '=', 'u.id')
            })
            .leftJoin('exceptions as e', function(){
                this.on('c.exception_id', '=', 'e.id')
            })
            .where('e.id', exceptionId)
            .andWhere('e.deleted_at', null);
        return knexnest(query).then(data => data);
    }
    async getCommentCreatorFullName(): Promise<any> {
        const currentUserId = this._loggedInUser.id;
        const knex = await this.databaseService.getConnection();
        const query = knex
            .select(
                knex.raw(`CONCAT(u.first_name, ' ', u.last_name) as "_fullName"`)
            )
            .from('users as u')
            .where('u.id', currentUserId);
        return knexnest(query)
            .then(data => {
                return data;
            });

    }

    async deleteCommentById(commentId: number): Promise<any> {
        const knex = await this.databaseService.getConnection();
        const deleteComment = {
            deleted_at: Math.round((new Date()).getTime()),
            deleted_by: this._loggedInUser.id
        }
        return knex.where('id', commentId)
            .andWhere('user_id', this._loggedInUser.id)
            .update(deleteComment,['id'])
            .into('exception_comments');
    }

}
