import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import { Controller, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Gatekeeper')
@ApiBearerAuth('jwt-auth')
@Controller('constraints')
@UseInterceptors(ResponseTransformerInterceptor)
export class GatekeeperConstraintController {

}
