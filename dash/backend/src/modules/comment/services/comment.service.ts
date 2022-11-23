import { Injectable } from '@nestjs/common';
import { CommentDto } from "../dto/comment-dto";
import { CommentDao } from "../dao/comment.dao";
import { instanceToPlain } from 'class-transformer';
import { EmailService } from "../../shared/services/email.service";
import {ConfigService} from "@nestjs/config";
import {ClusterDto} from "../../cluster/dto/cluster-dto";

@Injectable()
export class CommentService{

    constructor(private readonly commentDao: CommentDao,
                private readonly email: EmailService,
                private readonly configService: ConfigService) {}

    async getAllComments(exceptionId: number): Promise<CommentDto[]> {
        return await this.commentDao.getAllComments(exceptionId);
    }

    async createComment(commentData: CommentDto): Promise<number> {
        const commentBody = instanceToPlain(commentData);
        delete commentBody['id'];
        delete commentBody['user'];
        const commentId = await this.commentDao.createComment(commentBody);
        const getUsersToMail = await this.commentDao.getAllUsersToMail(commentData.exceptionId);
        const exceptionTitle = getUsersToMail[0].title;
        const getUsers = getUsersToMail[0].user;
        const getCommentCreatorFullName = await this.commentDao.getCommentCreatorFullName();
        const commentCreatorFullName = getCommentCreatorFullName[0].fullName;
        const commentContent = commentBody['content'];
        /*
        console.log("*******COMMENT*******");
        console.log(" commentcreator fullname: ", commentCreatorFullName);
        console.log(" commentContent : ", CommentContent );
        console.log(" exceptiontitle: ", exceptionTitle );

         */

        for(const user of getUsers){
           // console.log("current user is: ", user.fullname);

            await this.email.send({
                to: user.email,
                from: this.configService.get('email.default.sender'),
                subject: `${exceptionTitle} discussion`,
                template: 'exception-comment-notification',
                context: {
                    user: user.fullname,
                    exceptionTitle: exceptionTitle,
                    commentCreatorFullName: commentCreatorFullName,
                    commentContent: commentContent
                }
            });


        }
        return commentId;
    }

    async deleteCommentById(id: number): Promise<number>{
        const results = await this.commentDao.deleteCommentById(id);
        if (results && Array.isArray(results) && results.length > 0) {
            return results[0];
        }
        return null;
    }
}
