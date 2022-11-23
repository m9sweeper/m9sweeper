import { PodDto } from '../../pod/dto/pod-dto';
import { PodHistoryDto } from '../../pod/dto/pod-history-dto';

export class NamespaceComplianceDto {
    id: number;

    name: string;

    selfLink: string;

    uid: string;

    clusterId: number;

    resourceVersion: string;

    creationTimestamp: number;

    compliant: boolean;

    savedDate: string;
    
    pods: PodDto[]
}

export class NamespaceComplianceResultDto {
    id: number;

    compliant: boolean;
}

