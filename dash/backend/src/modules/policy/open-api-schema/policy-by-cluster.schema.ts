import {PoliciesByClusterIdDto} from '../dto/policy-dto';
import {ApiProperty} from '@nestjs/swagger';
import {StandardResponse} from '../../shared/dto/response.dto';

class PolicyWithScannerDto  extends PoliciesByClusterIdDto {}

export class PoliciesByClusterResponse extends StandardResponse {
    @ApiProperty({
        isArray: true,
        type: PolicyWithScannerDto
    })
    data: PolicyWithScannerDto[]
}
