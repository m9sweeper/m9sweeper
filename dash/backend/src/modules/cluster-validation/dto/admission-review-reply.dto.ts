import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {IsOptional} from "class-validator";

export class AdmissionReviewReplyResponseStatus {

  @ApiProperty()
  message: string;

}


export class AdmissionReviewReplyResponse {

  @ApiProperty()
  uid: string;

  @ApiProperty()
  allowed: boolean;

  @ApiProperty()
  @Type(() => AdmissionReviewReplyResponseStatus)
  status: AdmissionReviewReplyResponseStatus;

}


export class AdmissionReviewReplyDto {

  constructor() {
    this.response = new AdmissionReviewReplyResponse();
  }

  @ApiProperty()
  apiVersion: string;

  @ApiProperty()
  kind: string;

  @ApiProperty()
  @Type(() => AdmissionReviewReplyResponse)
  response: AdmissionReviewReplyResponse;

  @ApiProperty()
  @IsOptional()
  enforcementMessage: string;
}