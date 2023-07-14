import {Expose} from 'class-transformer';
import {IsNumber, IsOptional, IsString} from 'class-validator';


export class FalcoOutputFieldsDto {
    @Expose({name: 'container.id'})
    @IsString()
    @IsOptional()
    containerId: string;

    @Expose({name: 'container.image'})
    @IsString()
    @IsOptional()
    containerImage: string;

    @Expose({name: 'container.image.repository'})
    @IsString()
    @IsOptional()
    containerImageRepository: string;

    @Expose({name: 'container.image.tag'})
    @IsString()
    @IsOptional()
    containerImageTag: string;

    @Expose({name: 'evt.arg.uid'})
    @IsString()
    @IsOptional()
    eventArgUid: string;

    @Expose({name: 'evt.time'})
    @IsNumber()
    @IsOptional()
    eventTime: number;

    @Expose({name: 'k8s.ns.name'})
    @IsString()
    @IsOptional()
    k8sNamespaceName: string;

    @Expose({name: 'k8s.pod.name'})
    @IsString()
    @IsOptional()
    k8sPodName: string;

    @Expose({name: 'proc.cmdline'})
    @IsString()
    @IsOptional()
    processCmdline: string;

    @Expose({name: 'proc.pid'})
    @IsNumber()
    @IsOptional()
    processPid: number;

    @Expose({name: 'proc.pname'})
    @IsString()
    @IsOptional()
    processName: string;

    @Expose({name: 'user.loginuid'})
    @IsNumber()
    @IsOptional()
    userLoginuid: number;

    @Expose({name: 'user.name'})
    @IsString()
    @IsOptional()
    userName: string;

    @Expose({name: 'user.uid'})
    @IsNumber()
    @IsOptional()
    userUid: number;
}
