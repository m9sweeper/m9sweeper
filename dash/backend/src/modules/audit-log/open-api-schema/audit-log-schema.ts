export const ALL_API_KEY_RESPONSE_SCHEMA = {
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
                            "userId",
                            "name",
                            "api",
                            "isActive",
                            "createdBy",
                            "updatedBy"
                        ],
                        "properties": {
                            "id": {
                                "type": "integer"
                            },
                            "userId": {
                                "type": "integer"
                            },
                            "name": {
                                "type": "string"
                            },
                            "api": {
                                "type": "string"
                            },
                            "isActive": {
                                "type": "boolean"
                            },
                            "createdBy": {
                                "type": "string"
                            },
                            "updatedBy": {
                                "type": "string"
                            }
                        }
                    }
                ]
            }
        }
    }
};


