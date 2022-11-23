export const SCANNER_RESPONSE_SCHEMA = {
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
                            "type",
                            "enabled",
                            "required",
                            "description",
                            "policyId"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            },
                            "name": {
                                "type": "string"
                            },
                            "type": {
                              "type": "string"
                            },
                            "enabled": {
                                "type": "boolean"
                            },
                            "required": {
                                "type": "boolean"
                            },
                            "description": {
                                "type": "string"
                            },
                            "policyId": {
                                "type": "integer"
                            }
                        }
                    }
                ]
            }
        }
    }
};
export const UPDATE_SCANNER_RESPONSE_SCHEMA = {
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

