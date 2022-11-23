import { Global, Module}  from '@nestjs/common';
import { TagController } from './controllers/tag.controller';
import { TagDao } from './dao/tag.dao';
import { TagService } from './services/tag.service';

@Global()
@Module({
    providers: [
        TagDao,
        TagService
    ],
    exports: [
        TagDao,
        TagService
    ],
    controllers: [
        TagController
    ]
})

export class TagModule{}