import {StandardResponse} from '../../shared/dto/response.dto';
import {ApiProperty} from '@nestjs/swagger';
import {ClusterDto} from '../dto/cluster-dto';

export const ALL_CLUSTER_LIST_RESPONSE_SCHEMA= {
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
                            "tags",
                            "group"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            },
                            "name": {
                                "type": "string"
                            },
                            "group": {
                                "type": "object",
                                "required":[
                                    "id",
                                    "name"
                                ],
                                "properties":{
                                    "id":{
                                        "type": "number"
                                    },
                                    "name":{
                                        "type": "string"
                                    }
                                }
                            },
                            "tags": {
                                "type": "array",
                                "items": {
                                    "anyOf": [
                                        {
                                            "type": "object",
                                            "required": [
                                                "id",
                                                "name"
                                            ],
                                            "properties": {
                                                "name": {
                                                    "type": "string"
                                                },
                                                "id": {
                                                    "type": "integer"
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                ]
            }
        }
    }
};

export const CREATE_CLUSTER_RESPONSE_SCHEMA = {
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
                "ipAddress",
                "port",
                "apiKey",
                "context",
                "groupId",
                "tags"
            ],
            "properties": {
                "id": {
                    "type": "integer"
                },
                "name": {
                    "type": "string"
                },
                "ipAddress": {
                    "type": "string"
                },
                "port": {
                    "type": "string"
                },
                "apiKey": {
                    "type": "string"
                },
                "context": {
                    "type": "string"
                },
                "groupId": {
                    "type": "object",
                    "required":[
                        "id",
                        "name"
                    ],
                    "properties":{
                        "id":{
                            "type": "number"
                        },
                        "name":{
                            "type": "string"
                        }
                    }
                },
                "tags": {
                    "type": "array",
                    "items": {
                        "anyOf": [
                            {
                                "type": "object",
                                "required": [
                                    "id",
                                    "name"
                                ],
                                "properties": {
                                    "name": {
                                        "type": "string"
                                    },
                                    "id": {
                                        "type": "integer"
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

export const UPDATE_CLUSTER_SCHEMA_RESPONSE =  {
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

export const GROUP_BY_ID_CLUSTER_RESPONSE_SCHEMA = {
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
                            "ipAddress",
                            "port",
                            "context",
                            "tags",
                            "kubeConfig"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            },
                            "name": {
                                "type": "string"
                            },
                            "ipAddress": {
                                "type": "string"
                            },
                            "port": {
                                "type": "string"
                            },
                            "context": {
                                "type": "string"
                            },
                            "kubeConfig":{
                              "type": "string"
                            },
                            "tags": {
                                "type": "array",
                                "items": {
                                    "anyOf": [
                                        {
                                            "type": "object",
                                            "required": [
                                                "id",
                                                "name"
                                            ],
                                            "properties": {
                                                "name": {
                                                    "type": "string"
                                                },
                                                "id": {
                                                    "type": "integer"
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                ]
            }
        }
    }
};

export const SEARCH_BY_GROUP_CLUSTER_RESPONSE_SCHEMA = {
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
                            "ipAddress",
                            "port",
                            "api_key",
                            "groupId",
                            "context",
                            "tags",
                            "createdAt",
                            "updatedAt",
                            "deletedAt",
                            "kubeConfig"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            },
                            "name": {
                                "type": "string"
                            },
                            "ipAddress": {
                                "type": "string"
                            },
                            "port": {
                                "type": "string"
                            },
                            "api_key":{
                              "type": "string"
                            },
                            "groupId":{
                                "type": "number"
                            },
                            "createdAt":{
                                "type": "number"
                            },
                            "updatedAt":{
                                "type": "number"
                            },
                            "deletedAt":{
                                "type": "number"
                            },
                            "context": {
                                "type": "string"
                            },
                            "kubeConfig":{
                                "type": "string"
                            },
                            "tags": {
                                "type": "array",
                                "items": {
                                    "anyOf": [
                                        {
                                            "type": "object",
                                            "required": [
                                                "id",
                                                "name"
                                            ],
                                            "properties": {
                                                "name": {
                                                    "type": "string"
                                                },
                                                "id": {
                                                    "type": "integer"
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                ]
            }
        }
    }
};

export const DELETE_CLUSTER_RESPONSE_SCHEMA = {
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
                "id":{
                    "type": "number"
                }
            }
        }
    }
}

export const GET_NEXT_CLUSTER_ID = {
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
            "properties":{
                "nextClusterId":{
                    "type": "number"
                }
            }
        }
    }
}


export class ClusterResponse extends StandardResponse {
    @ApiProperty({ type: () => ClusterDto })
    data: ClusterDto;
}
