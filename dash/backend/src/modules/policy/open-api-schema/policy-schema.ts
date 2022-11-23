export const POLICY_RESPONSE_SCHEMA = {
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
                            "description",
                            "scannerIds"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            },
                            "name": {
                                "type": "string"
                            },
                            "description": {
                                "type": "string"
                            },
                            "scannerIds": {
                                "type": "array",
                                "items": {
                                    "anyOf": [
                                        {
                                            "type": "object",
                                            "required": [
                                                "scannerId",
                                                "enabled",
                                                "required"
                                            ],
                                            "properties": {
                                                "scannerId": {
                                                    "type": "integer"
                                                },
                                                "enabled": {
                                                    "type": "boolean"
                                                },
                                                "required": {
                                                    "type": "boolean"
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
export const CREATE_POLICY_RESPONSE_SCHEMA = {
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
                "description",
                "enabled",
                "enforcement"
            ],
            "properties": {
                "id": {
                    "type": "integer"
                },
                "name": {
                    "type": "string"
                },
                "description": {
                    "type": "string"
                },
                "enabled":{
                    "type": "boolean"
                },
                "enforcement":{
                    "type": "boolean"
                }

            }
        }
    }
};
export const DELETE_POLICY_RESPONSE_SCHEMA = {
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
