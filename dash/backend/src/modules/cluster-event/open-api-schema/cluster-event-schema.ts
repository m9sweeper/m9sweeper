export const CLUSTER_EVENT_RESPONSE_SCHEMA = {
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
                            "organizationId",
                            "entityId"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            },
                            "organizationId": {
                                "type": "integer"
                            },
                            "entityType": {
                                "type": "string"
                            },
                            "entityId": {
                                "type": "integer"
                            },
                            "createdDate": {
                                "type": "integer"
                            },
                            "type": {
                                "type": "string"
                            },
                            "level": {
                                "type": "string"
                            },
                            "description": {
                                "type": "string"
                            },
                            "data": {
                                "type": "object"
                            }

                        }
                    }
                ]
            }
        }
    }
};

export const CREATE_CLUSTER_EVENT_RESPONSE_SCHEMA =  {
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
                            "id"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            }
                        }
                    }
                ]
            }
        }
    }
};
