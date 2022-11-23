import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { ScannerDao } from '../dao/scanner.dao';
import { ScannerDto } from '../dto/scanner-dto';

@Injectable()
export class ScannerService {
    constructor(private readonly scannerDao: ScannerDao) {}

    async getAllScanners(): Promise<ScannerDto[]>{
        return await this.scannerDao.getAllScanners();
    }

    async createScanner(scanner: ScannerDto): Promise<ScannerDto> {
        const scannerId: number = await this.scannerDao.createScanner(scanner);
        return await this.getScannerById(scannerId);
    }

    async updateScanner(scannerData: ScannerDto, id: number): Promise<number> {
        const checkScannerName = await this.scannerDao.getScannerDetails(
            {'name': scannerData.name},
            id);
        if(checkScannerName && checkScannerName.length > 0){
            throw new HttpException({ status: HttpStatus.CONFLICT, message: 'Scanner Name already exists'}, HttpStatus.CONFLICT)
        }
        return await this.scannerDao.updateScanner(scannerData, id);

    }

    async getScannerById(id: number): Promise<ScannerDto> {
        return await this.scannerDao.getScannerById(id);
    }

    async getScannersByPolicyId(policyId: number): Promise<ScannerDto[]> {
        return await this.scannerDao.getScannersByPolicyId(policyId);
    }

    async deleteScannerById(id: number): Promise<number>{
        const results = await this.scannerDao.deleteScannerById(id);
        if (results && Array.isArray(results) && results.length > 0) {
            return results[0].id;
        }
        return null;
    }
}
