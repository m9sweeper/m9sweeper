export const SITE_SETTINGS_RESPONSE_SCHEMA = {
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
                            "name",
                            "value"
                        ],
                        "properties": {
                            "name": {
                                "type": "string",
                                "examples": ["SITE_NAME / SITE_LOGO"]
                            },
                            "value": {
                                "type": "string"
                            }
                        }
                    }
                ],
            }
        }
    }
};

export const SITE_TITLE_RESPONSE_SCHEMA = {
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
            "type": "string"
        }
    }
};
