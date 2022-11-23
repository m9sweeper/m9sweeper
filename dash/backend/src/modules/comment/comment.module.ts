import { Global, Module}  from '@nestjs/common';
import { CommentController } from "./controllers/comment.controller";
import { CommentDao } from "./dao/comment.dao";
import { CommentService } from "./services/comment.service";

@Global()
@Module({
    providers: [
        CommentDao,
        CommentService
    ],
    exports: [
        CommentDao,
        CommentService
    ],
    controllers: [
        CommentController
    ]
})

export class CommentModule{}