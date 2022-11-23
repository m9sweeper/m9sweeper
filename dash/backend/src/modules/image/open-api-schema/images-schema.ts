import {StandardResponse} from '../../shared/dto/response.dto';
import {ApiProperty} from '@nestjs/swagger';
import {ClusterDto} from '../../cluster/dto/cluster-dto';
import {ListOfImagesDto} from '../dto/image-result.dto';
import {IsBoolean, IsNumber, IsOptional, IsString} from 'class-validator';
import {Expose, Type} from 'class-transformer';

export const ALL_IMAGES_RESPONSE_SCHEMA = {
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
                "total",
                "listOfImages"
            ],
            "properties": {
                "total": {
                    "type": "number"
                },
                "listOfImages": {
                    "type": "array",
                    "items": {
                        "allOf": [
                            {
                                "type": "object",
                                "required": [
                                    "id",
                                    "url",
                                    "clusterId",
                                    "name",
                                    "tag",
                                    "dockerImageId",
                                    "summary",
                                    "scanResult",
                                    "lastScanned",
                                    "runningInCluster",
                                    "scanResults"
                                ],
                                "properties": {
                                    "id": {
                                        "type": "integer"
                                    },
                                    "url": {
                                        "type": "string"
                                    },
                                    "clusterId": {
                                        "type": "integer"
                                    },
                                    "name": {
                                        "type": "string"
                                    },
                                    "tag": {
                                        "type": "string"
                                    },
                                    "dockerImageId": {
                                        "type": "string"
                                    },
                                    "summary": {
                                        "type": "string"
                                    },
                                    "scanResult": {
                                        "type": "string"
                                    },
                                    "lastScanned": {
                                        "type": "string"
                                    },
                                    "runningInCluster": {
                                        "type": "boolean"
                                    },
                                    "scanResults": {
                                        "type": "string"
                                    }
                                }
                            }
                        ]
                    }
                }
            }

        }
    }
};
export const SEARCH_IMAGES_RESPONSE_SCHEMA = {
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
                "totalCount",
                "list"
            ],
            "properties": {
                "totalCount": {
                    "type": "number"
                },
                "list": {
                    "type": "array",
                    "items": {
                        "allOf": [
                            {
                                "type": "object",
                                "required": [
                                    "id",
                                    "url",
                                    "clusterId",
                                    "name",
                                    "tag",
                                    "dockerImageId",
                                    "summary",
                                    "scanResult",
                                    "lastScanned",
                                    "runningInCluster",
                                    "scanResults"
                                ],
                                "properties": {
                                    "id": {
                                        "type": "integer"
                                    },
                                    "url": {
                                        "type": "string"
                                    },
                                    "clusterId": {
                                        "type": "integer"
                                    },
                                    "name": {
                                        "type": "string"
                                    },
                                    "tag": {
                                        "type": "string"
                                    },
                                    "dockerImageId": {
                                        "type": "string"
                                    },
                                    "summary": {
                                        "type": "string"
                                    },
                                    "scanResult": {
                                        "type": "string"
                                    },
                                    "lastScanned": {
                                        "type": "string"
                                    },
                                    "runningInCluster": {
                                        "type": "boolean"
                                    },
                                    "scanResults": {
                                        "type": "string"
                                    }
                                }
                            }
                        ]
                    }
                }
            }

        }
    }
};

export const CREATE_IMAGE_RESPONSE_SCHEMA = {
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
                "url",
                "clusterId",
                "name",
                "tag",
                "dockerImageId",
                "summary",
                "scanResult",
                "lastScanned",
                "runningInCluster",
                "scanResults"
            ],
            "properties": {
                "id": {
                    "type": "integer"
                },
                "url": {
                    "type": "string"
                },
                "clusterId": {
                    "type": "integer"
                },
                "name": {
                    "type": "string"
                },
                "tag": {
                    "type": "string"
                },
                "dockerImageId": {
                    "type": "string"
                },
                "summary": {
                    "type": "string"
                },
                "scanResult": {
                    "type": "string"
                },
                "lastScanned": {
                    "type": "string"
                },
                "runningInCluster": {
                    "type": "boolean"
                },
                "scanResults": {
                    "type": "string"
                }
            }

        }
    }
};

export const DELETE_IMAGE_RESPONSE_SCHEMA = {
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

export const IMAGE_SUMMARY_RESPONSE_SCHEMA = {
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
                "allOf": [
                    {
                        "type": "object",
                        "required": [
                            "count",
                            "compliant"
                        ],
                        "properties": {
                            "count": {
                                "type": "integer"
                            },
                            "compliant": {
                                "type": "boolean"
                            }
                        }
                    }
                ]
            }
        }
    }
};

export const SCAN_IMAGE_RESPONSE_SCHEMA = {
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
            "type": "boolean"

        }
    }
};

export const IMAGE_SCAN_RESULT_DETAILS_RESPONSE_SCHEMA = {
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
                "scannerName",
                "imageId",
                "issues",
                "scanResult",
                "criticalIssues",
                "majorIssues",
                "mediumIssues",
                "lowIssues",
                "negligibleIssues",
                "createdAt",
                "updatedAt"
            ],
            "properties": {
                "id": {
                    "type": "number"
                },
                "scannerName": {
                    "type": "string"
                },
                "imageId": {
                    "type": "number"
                },
                "issues": {
                    "type": "array",
                    "items": {
                        "allOf": [
                            {
                                "type": "object",
                                "required": [
                                    "scannerId",
                                    "name",
                                    "type",
                                    "severity",
                                    "description",
                                    "isCompliant",
                                    "isFixable",
                                    "wasFixed"
                                ],
                                "properties": {
                                    "scannerId": {
                                        "type": "number"
                                    },
                                    "name": {
                                        "type": "string"
                                    },
                                    "type": {
                                        "type": "string"
                                    },
                                    "severity": {
                                        "type": "string"
                                    },
                                    "description": {
                                        "type": "string"
                                    },
                                    "isCompliant": {
                                        "type": "boolean"
                                    },
                                    "isFixable": {
                                        "type": "boolean"
                                    },
                                    "wasFixed": {
                                        "type": "boolean"
                                    }
                                }
                            }
                        ]
                    }
                },
                "scanResult": {
                    "type": "string"
                },
                "criticalIssues": {
                    "type": "number"
                },
                "majorIssues": {
                    "type": "number"
                },
                "mediumIssues": {
                    "type": "number"
                },
                "lowIssues": {
                    "type": "number"
                },
                "negligibleIssues": {
                    "type": "number"
                },
                "createdAt": {
                    "type": "number"
                },
                "updatedAt": {
                    "type": "number"
                }
            }

        }
    }
};

export const TOTAL_SEVERITY_RESPONSE_SCHEMA = {
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
                "allOf": [
                    {
                        "type": "object",
                        "required": [
                            "namespace",
                            "imageUrl",
                            "imageName",
                            "criticalIssues",
                            "majorIssues",
                            "mediumIssues",
                            "lowIssues",
                            "negligibleIssues"
                        ],
                        "properties": {
                            "namespace": {
                                "type": "string"
                            },
                            "imageUrl": {
                                "type": "string"
                            },
                            "imageName": {
                                "type": "string"
                            },
                            "criticalIssues": {
                                "type": "number"
                            },
                            "majorIssues": {
                                "type": "number"
                            },
                            "mediumIssues": {
                                "type": "number"
                            },
                            "lowIssues": {
                                "type": "number"
                            },
                            "negligibleIssues": {
                                "type": "number"
                            }

                        }
                    }
                ]
            }
        }
    }
};

export const TOTAL_VULNERABILITY_RESPONSE_SCHEMA = {
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
                "allOf": [
                    {
                        "type": "object",
                        "required": [
                            "criticalIssues",
                            "majorIssues",
                            "mediumIssues",
                            "lowIssues",
                            "negligibleIssues",
                            "savedAtDate"
                        ],
                        "properties": {
                            "criticalIssues": {
                                "type": "number"
                            },
                            "majorIssues": {
                                "type": "number"
                            },
                            "mediumIssues": {
                                "type": "number"
                            },
                            "lowIssues": {
                                "type": "number"
                            },
                            "negligibleIssues": {
                                "type": "number"
                            },
                            "savedAtDate": {
                                "type": "string"
                            }
                        }
                    }
                ]
            }
        }
    }
};

export const TOTAL_POLICY_VIOLATION = {
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
                "allOf": [
                    {
                        "type": "object",
                        "required": [
                            "count"
                        ],
                        "properties": {
                            "count": {
                                "type": "integer"
                            }
                        }
                    }
                ]
            }
        }
    }
};

export const TOTAL_IMAGE_SCAN_COUNT_RESPONSE_SCHEMA = {
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
                "allOf": [
                    {
                        "type": "object",
                        "required": [
                            "count",
                            "date"
                        ],
                        "properties": {
                            "count": {
                                "type": "integer"
                            },
                            "date": {
                                "type": "integer"
                            }
                        }
                    }
                ]
            }
        }
    }
};


export class ImageDetailsDto {

    @ApiProperty()
    @Expose()
    @IsNumber()
    id: number;

    @ApiProperty()
    @Expose()
    @IsString()
    url: string;

    @ApiProperty()
    @Expose()
    @IsString()
    name: string

    @ApiProperty()
    @Expose()
    @IsString()
    tag: string;

    @ApiProperty()
    @Expose()
    @IsString()
    dockerImageId: string;

    @ApiProperty()
    @Expose()
    @IsNumber()
    clusterId: number;

    @ApiProperty()
    @Expose()
    @IsString()
    summary:string;
}

export class ImageDetailsResponseDto extends StandardResponse {

    @ApiProperty({
        type: () =>  ImageDetailsDto,
    })
    @Expose()
    @Type(() => ImageDetailsDto)
    data: ImageDetailsDto;
}

export const IMAGE_SCAN_QUEUE_STATUS_SCHEMA = {
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
            "type": "boolean"

        }
    }
};

export const NAMESPACE_ID_SCHEMA = {
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
                "allOf": [
                    {
                        "type": "object",
                        "required": [
                            "name"
                        ],
                        "properties": {
                            "name": {
                                "type": "string"
                            }
                        }
                    }
                ]
            }
        }
    }
};
