import {Expose} from 'class-transformer';

export class ResetPasswordModel {
    id: number;

    @Expose({name: 'account_id', toPlainOnly: true})
    userId: number;

    @Expose({name: 'token', toPlainOnly: true})
    token: string;

    @Expose({name: 'generated_at', toPlainOnly: true})
    generatedAt: number;

    @Expose({name: 'expired_at', toPlainOnly: true})
    expiredAt: number;

    @Expose({name: 'is_used', toPlainOnly: true})
    isUsed: boolean;
}
