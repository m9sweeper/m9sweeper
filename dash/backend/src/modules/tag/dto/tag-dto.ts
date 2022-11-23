import { Expose } from 'class-transformer';

export class TagDto{

    @Expose({name: 'id', toPlainOnly: true})
    id: number

    @Expose({name: 'name', toPlainOnly: true })
    name: string;

    @Expose({name: 'group_id', toPlainOnly:true })
    groupId: number;
}
