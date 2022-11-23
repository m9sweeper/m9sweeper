import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AdmissionReviewRequestKind {

  @ApiProperty()
  group: string;

  @ApiProperty()
  version: string;

  @ApiProperty()
  kind: string;

}


export class AdmissionReviewRequestResource {

  @ApiProperty()
  group: string;

  @ApiProperty()
  version: string;

  @ApiProperty()
  resource: string;

}


export class AdmissionReviewRequestUser {

  @ApiProperty()
  username: string;

  @ApiProperty()
  uid: string;

  @ApiProperty()
  group: string[];

}


export class AdmissionReviewRequest {

  @ApiProperty()
  uid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  namespace: string;

  @ApiProperty()
  operation: string;

  @ApiProperty()
  @Type(() => AdmissionReviewRequestKind)
  kind: AdmissionReviewRequestKind;

  @ApiProperty()
  @Type(() => AdmissionReviewRequestResource)
  resource: AdmissionReviewRequestResource;

  @ApiProperty()
  @Type(() => AdmissionReviewRequestKind)
  requestKind: AdmissionReviewRequestKind;

  @ApiProperty()
  @Type(() => AdmissionReviewRequestResource)
  requestResource: AdmissionReviewRequestResource;

  @ApiProperty()
  @Type(() => AdmissionReviewRequestUser)
  userInfo: AdmissionReviewRequestUser;

  @ApiProperty()
  object: any;

}

export class AdmissionReviewDto {

  @ApiProperty()
  kind: string;

  @ApiProperty()
  apiVersion: string;

  @ApiProperty()
  @Type(() => AdmissionReviewRequest)
  request: AdmissionReviewRequest;

}
