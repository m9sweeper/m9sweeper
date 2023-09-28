import {Expose} from "class-transformer";
import { IsJSON, IsNumber, IsOptional, IsString } from 'class-validator';

export class KubeBenchLogDto {
    @IsJSON()
    kubeBenchLog: {
        Controls: {
            id: string,
            version: string,
            detected_version: string,
            text: string,
            node_type: string,
            tests: {
                section: string,
                type: string,
                pass: number,
                fail: number,
                warn: number,
                info: number,
                desc: string,
                results: {
                    test_number: string,
                    test_desc: string,
                    audit: string,
                    AuditEnv: string,
                    AuditConfig: string,
                    type: string,
                    remediation: string,
                    test_info: string[],
                    status: string,
                    actual_value: string,
                    scored: boolean,
                    isMultiple: boolean,
                    expected_result: string,
                }[]
            }[],
            total_pass: number,
            total_fail: number,
            total_warn: number,
            total_info: number,
        }[],
        Totals: {
            total_pass: number,
            total_fail: number,
            total_warn: number,
            total_info: number,
        }
    }
}

// this will have either Totals or just the raw values
export class KubeBenchSummaryDto {
    @IsJSON()
    @IsOptional()
    Totals: {
        total_pass: number,
        total_fail: number,
        total_warn: number,
        total_info: number,
    }

    @IsOptional()
    @IsNumber()
    total_pass: number;

    @IsOptional()
    @IsNumber()
    total_fail: number;

    @IsOptional()
    @IsNumber()
    total_warn: number;

    @IsOptional()
    @IsNumber()
    total_info: number;
}

export class KubeBenchSummaryTimestampedDto {
    @IsJSON()
    Totals: KubeBenchSummaryDto;

    @IsNumber()
    createdAt: number;
}

export class KubeBenchDto {
    @Expose({name: 'cluster_id', toPlainOnly: true})
    @IsNumber()
    clusterId: number;

    /** Deprectated */
    @IsString()
    uuid: string;

    @Expose({name: 'results_json', toPlainOnly: true})
    @IsJSON()
    resultsJson: KubeBenchLogDto;

    @Expose({name: 'results_summary', toPlainOnly: true})
    @IsJSON()
    resultsSummary: KubeBenchSummaryDto;

    @Expose({name: 'created_at', toPlainOnly: true})
    @IsNumber()
    createdAt?: number;

}

