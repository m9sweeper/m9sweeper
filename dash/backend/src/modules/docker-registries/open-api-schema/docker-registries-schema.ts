import {SearchCondition} from '../../shared/enums/SearchCondition';
import {Expose, plainToInstance, Transform, Type} from 'class-transformer';
import {IsEnum, IsIn, IsInt, IsOptional, ValidateNested} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {StandardResponse} from '../../shared/dto/response.dto';
import {DockerRegistriesDto} from '../dto/docker-registries-dto';

export const DOCKER_REGISTRY_RESPONSE_SCHEMA = {
    "type": "object",
    "required": [
        "success",
        "message",
        "data"
    ],
    "properties": {
        "success": {
            "type": "boolean"
        },
        "message": {
            "type": "string"
        },
        "data": {
            "type": "array",
            "items": {
                "anyOf": [
                    {
                        "type": "object",
                        "required": [
                            "id",
                            "name",
                            "hostname",
                            "loginRequired",
                            "username",
                            "password"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            },
                            "name": {
                                "type": "string"
                            },
                            "hostname": {
                                "type": "string"
                            },
                            "loginRequired": {
                                "type": "boolean"
                            },
                            "username": {
                                "type": "string"
                            },
                            "password": {
                                "type": "string"
                            }
                        }
                    }
                ]
            }
        }
    }
};
export const UPDATE_DOCKER_REGISTRY_RESPONSE_SCHEMA  = {
    "type": "object",
    "required": [
        "success",
        "message",
        "data"
    ],
    "properties": {
        "success": {
            "type": "boolean"
        },
        "message": {
            "type": "string"
        },
        "data": {
            "type": "number"
        }
    }
};
export const DELETE_DOCKER_REGISTRY_RESPONSE_SCHEMA  = {
    "type": "object",
    "required": [
        "success",
        "message",
        "data"
    ],
    "properties": {
        "success": {
            "type": "boolean"
        },
        "message": {
            "type": "string"
        },
        "data": {
            "type": "object",
            "required":[
                "id"
            ],
            "properties":{
                "id": {
                    "type": "number"
                }
            }
        }
    }
};
export const GET_SINGLE_DOCKER_REGISTRY_RESPONSE_SCHEMA = {
    "type": "object",
    "required": [
        "success",
        "message",
        "data"
    ],
    "properties": {
        "success": {
            "type": "boolean"
        },
        "message": {
            "type": "string"
        },
        "data": {
            "type": "object",
            "required": [
                "id",
                "name",
                "hostname",
                "loginRequired",
                "username",
                "password"
            ],
            "properties": {
                "id": {
                    "type": "integer"
                },
                "name": {
                    "type": "string"
                },
                "hostname": {
                    "type": "string"
                },
                "loginRequired": {
                    "type": "boolean"
                },
                "username": {
                    "type": "string"
                },
                "password": {
                    "type": "string"
                }
            }
        }
    }
};


export const REGISTRY_QUERY_PARAMS_SCHEMA = {
    "filter": {
        "type": "array",
        "title": "RegistryQueryFiltersDto",
        "default": [],
        "examples": [
            [
                {
                    "condition": "",
                    "key": "",
                    "value": ""
                }
            ]
        ],
        "additionalItems": true,
        "items": {
            "title": 'RegistryQueryFilterDto',
            "properties": {
                "condition": {
                    "type": "string",
                    "enum": ["NOT_IN", "IN", "EQUAL", "NOT_EQUAL", "LIKE", "CUSTOM"],
                    "default": "EQUAL",
                    "examples": [
                        ""
                    ]
                },
                "key": {
                    "type": "string",
                    "default": "",
                    "examples": [
                        ""
                    ]
                },
                "value": {
                    "type": "string",
                    "default": "",
                    "examples": [
                        ""
                    ]
                }
            }
        }
    }
};


export class BaseFilter {
    @IsEnum(SearchCondition)
    condition: SearchCondition;

    @IsOptional()
    key: string;

    @IsOptional()
    value: any;
}

export class QueryPagination {

    @IsOptional()
    @Expose()
    @Transform(value => value || 0, { toClassOnly: true })
    @Type(() => Number)
    @IsInt()
    page: number;

    @IsOptional()
    @Expose()
    @Transform(value => value || 0, { toClassOnly: true })
    @Type(() => Number)
    @IsInt()
    limit: number;
}

export class QuerySort {

    @IsOptional()
    @Expose()
    @Transform(value => value || 'asc', { toClassOnly: true })
    @IsIn(['asc', 'desc'])
    direction: string;

    @IsOptional()
    @Expose()
    @Transform(value => value || 'id', { toClassOnly: true })
    @IsIn(['id', 'name', 'hostname', 'login_required', 'username'])
    field: string;
}

export class RegistryQueryParamsDto {

    @IsOptional()
    @Expose()
    @Transform(value => value || new QueryPagination(), { toClassOnly: true })
    @ValidateNested()
    @Type(() => QueryPagination)
    pagination: QueryPagination;


    @IsOptional()
    @Expose()
    @Transform(value => value || new QueryPagination(), { toClassOnly: true })
    @ValidateNested()
    @Type(() => QuerySort)
    sort: QuerySort;

    @IsOptional()
    @Expose()
    @Transform(({value}) => {
        value = value || [];
        return value.map(v => {
            // plainToInstance(BaseFilter, v)
            return plainToInstance(BaseFilter, JSON.parse(v));
        });
    }, { toClassOnly: true })
    @ValidateNested()
    @Type(() => BaseFilter)
    filter: BaseFilter[]

}

export class DockerRegistriesDataDto {
    @ApiProperty()
    totalCount: number | null;

    @ApiProperty({
        type: DockerRegistriesDto,
        isArray: true
    })
    list: DockerRegistriesDto[];
}

export class DockerRegistriesResponseDto extends StandardResponse {
    @ApiProperty({
        type: () => DockerRegistriesDataDto
    })
    data: DockerRegistriesDataDto;
}
