import {ApiBearerAuth, ApiResponse, ApiTags} from '@nestjs/swagger';
import {
    Body,
    Controller,
    Inject,
    Param,
    UseInterceptors,
    Get,
    Post,
    Put,
    Delete,
    UseGuards
} from '@nestjs/common';
import { ResponseTransformerInterceptor } from '../../../interceptors/response-transformer.interceptor';
import { ScannerService } from '../services/scanner.service';
import { ScannerDto } from '../dto/scanner-dto';
import { SCANNER_RESPONSE_SCHEMA, UPDATE_SCANNER_RESPONSE_SCHEMA } from '../open-api-schema/scanner-schema';
import { UserProfileDto } from '../../user/dto/user-profile-dto';
import { AllowedAuthorityLevels } from '../../../decorators/allowed-authority-levels.decorator'
import { AuthorityGuard } from '../../../guards/authority.guard';
import { AuthGuard } from '../../../guards/auth.guard';
import { Authority } from '../../user/enum/Authority';

@ApiTags('Scanner')
@ApiBearerAuth('jwt-auth')
@Controller()
@UseInterceptors(ResponseTransformerInterceptor)
export class ScannerController {
    constructor(@Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserProfileDto,
                private readonly scannerService: ScannerService) {}

    @Get()
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: SCANNER_RESPONSE_SCHEMA
    })
    async getAllScanners(): Promise<ScannerDto[]>{
        return await this.scannerService.getAllScanners();
    }

    @Get(':scannerId')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: SCANNER_RESPONSE_SCHEMA
    })
    async getScannerById(@Param('scannerId') scannerId: number): Promise<ScannerDto> {
        return await this.scannerService.getScannerById(scannerId);

    }

    @Post()
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: SCANNER_RESPONSE_SCHEMA
    })
    async createScanner(@Body() scannerData: ScannerDto): Promise<ScannerDto> {
        return await this.scannerService.createScanner(scannerData);

    }

    @Put(':scannerId')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: UPDATE_SCANNER_RESPONSE_SCHEMA
    })
    async updateScanner(@Body() scannerData: ScannerDto, @Param('scannerId') scannerId: number): Promise<number> {
        return await this.scannerService.updateScanner(scannerData, scannerId);
    }

    @Get('policy/:policyId')
    @AllowedAuthorityLevels(Authority.READ_ONLY, Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: SCANNER_RESPONSE_SCHEMA
    })
    async getScannersByPolicyId(@Param('policyId') policyId: number): Promise<ScannerDto[]> {
        return await this.scannerService.getScannersByPolicyId(policyId);
    }

    @Delete(':id')
    @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
    @UseGuards(AuthGuard, AuthorityGuard)
    @ApiResponse({
        status: 200,
        schema: UPDATE_SCANNER_RESPONSE_SCHEMA
    })
    async deleteScannerById(@Param('id') id: number): Promise<number>{
        return await this.scannerService.deleteScannerById(id);
    }

}
