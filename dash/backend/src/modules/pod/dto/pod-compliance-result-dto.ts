import { Expose } from 'class-transformer';
import {IsArray, IsBoolean, IsNumber, IsOptional, IsString} from "class-validator";
import {GateKeeperConstraintViolation} from "../../cluster/dto/deprecated-gatekeeper-constraint-dto";

export class PodComplianceResultDto {
    id: number;

    compliant: boolean;

    namespace: string;

    reason: string;
}
